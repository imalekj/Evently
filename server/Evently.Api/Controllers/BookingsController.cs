using Evently.Api.Data;
using Evently.Api.DTOs;
using Evently.Api.Models;
using Evently.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace Evently.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public BookingsController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    private static BookingDto ToDto(Booking b) => new(
        b.Id, b.TicketCode, b.Quantity, b.TotalPrice, b.Status, b.BookingDate,
        b.EventId, b.Event!.Title, b.Event.ImageUrl, b.Event.StartDate, b.Event.Location);

    [HttpGet("mine")]
    public async Task<ActionResult<List<BookingDto>>> GetMyBookings()
    {
        var userId = User.GetUserId();
        var bookings = await _db.Bookings
            .Include(b => b.Event)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return Ok(bookings.Select(ToDto));
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(BookingCreateDto dto)
    {
        var userId = User.GetUserId();

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var ev = await _db.Events.Include(e => e.Organizer).FirstOrDefaultAsync(e => e.Id == dto.EventId);
        if (ev is null) return NotFound(new { message = "Event not found." });

        if (ev.OrganizerId == userId)
        {
            return BadRequest(new { message = "You cannot book tickets for your own event." });
        }

        if (ev.StartDate <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "You cannot book tickets for an event that has already started." });
        }

        if (ev.AvailableTickets < dto.Quantity)
        {
            return BadRequest(new { message = $"Not enough tickets available. Remaining: {ev.AvailableTickets}." });
        }

        if (ev.Price > 0)
        {
            return BadRequest(new { message = "Paid events require checkout. Use /api/bookings/checkout instead." });
        }

        ev.AvailableTickets -= dto.Quantity;

        var booking = new Booking
        {
            EventId = ev.Id,
            UserId = userId,
            Quantity = dto.Quantity,
            TotalPrice = ev.Price * dto.Quantity,
            Status = BookingStatus.Confirmed
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        booking.Event = ev;
        return CreatedAtAction(nameof(GetMyBookings), ToDto(booking));
    }

    [HttpPost("checkout")]
    public async Task<ActionResult> CreateCheckoutSession(BookingCreateDto dto)
    {
        var secretKey = _config["Stripe:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return StatusCode(503, new { message = "Payments are not configured yet. Please try again later." });
        }

        var userId = User.GetUserId();
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == dto.EventId);
        if (ev is null) return NotFound(new { message = "Event not found." });

        if (ev.OrganizerId == userId)
        {
            return BadRequest(new { message = "You cannot book tickets for your own event." });
        }

        if (ev.StartDate <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "You cannot book tickets for an event that has already started." });
        }

        if (ev.AvailableTickets < dto.Quantity)
        {
            return BadRequest(new { message = $"Not enough tickets available. Remaining: {ev.AvailableTickets}." });
        }

        if (ev.Price <= 0)
        {
            return BadRequest(new { message = "This event is free. Use /api/bookings instead." });
        }

        var clientUrl = _config["Stripe:ClientUrl"] ?? "http://localhost:5173";
        var client = new StripeClient(secretKey);

        var sessionOptions = new SessionCreateOptions
        {
            Mode = "payment",
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Quantity = dto.Quantity,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmount = (long)Math.Round(ev.Price * 100),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = ev.Title,
                        },
                    },
                },
            },
            SuccessUrl = $"{clientUrl}/booking-success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{clientUrl}/events/{ev.Id}?checkout=cancelled",
            Metadata = new Dictionary<string, string>
            {
                { "eventId", ev.Id.ToString() },
                { "userId", userId.ToString() },
                { "quantity", dto.Quantity.ToString() },
            },
        };

        var service = new SessionService(client);
        var session = await service.CreateAsync(sessionOptions);

        return Ok(new { url = session.Url });
    }

    [HttpGet("confirm/{sessionId}")]
    public async Task<ActionResult<BookingDto>> ConfirmCheckout(string sessionId)
    {
        var secretKey = _config["Stripe:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            return StatusCode(503, new { message = "Payments are not configured yet." });
        }

        var userId = User.GetUserId();

        var existing = await _db.Bookings.Include(b => b.Event)
            .FirstOrDefaultAsync(b => b.StripeSessionId == sessionId);
        if (existing is not null)
        {
            if (existing.UserId != userId) return Forbid();
            return Ok(ToDto(existing));
        }

        var client = new StripeClient(secretKey);
        var sessionService = new SessionService(client);
        Session session;
        try
        {
            session = await sessionService.GetAsync(sessionId);
        }
        catch (StripeException)
        {
            return NotFound(new { message = "Checkout session not found." });
        }

        if (session.PaymentStatus != "paid")
        {
            return BadRequest(new { message = "Payment was not completed." });
        }

        if (!session.Metadata.TryGetValue("userId", out var metaUserId) || metaUserId != userId.ToString())
        {
            return Forbid();
        }

        var eventId = Guid.Parse(session.Metadata["eventId"]);
        var quantity = int.Parse(session.Metadata["quantity"]);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var ev = await _db.Events.Include(e => e.Organizer).FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev is null)
        {
            return NotFound(new { message = "Event not found." });
        }

        if (ev.AvailableTickets < quantity)
        {
            var paymentIntentId = session.PaymentIntentId;
            if (!string.IsNullOrEmpty(paymentIntentId))
            {
                var refundService = new RefundService(client);
                await refundService.CreateAsync(new RefundCreateOptions { PaymentIntent = paymentIntentId });
            }

            return BadRequest(new { message = "Tickets sold out while processing your payment. You have been automatically refunded." });
        }

        ev.AvailableTickets -= quantity;

        var booking = new Booking
        {
            EventId = ev.Id,
            UserId = userId,
            Quantity = quantity,
            TotalPrice = ev.Price * quantity,
            Status = BookingStatus.Confirmed,
            StripeSessionId = sessionId,
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        booking.Event = ev;
        return Ok(ToDto(booking));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = User.GetUserId();

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var booking = await _db.Bookings.Include(b => b.Event).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null) return NotFound();
        if (booking.UserId != userId) return Forbid();
        if (booking.Status == BookingStatus.Cancelled) return BadRequest(new { message = "This booking has already been cancelled." });

        booking.Status = BookingStatus.Cancelled;
        if (booking.Event is not null)
        {
            booking.Event.AvailableTickets += booking.Quantity;
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }
}
