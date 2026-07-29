using Evently.Api.Data;
using Evently.Api.DTOs;
using Evently.Api.Models;
using Evently.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Evently.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalEvents = await _db.Events.CountAsync();
        var upcomingEvents = await _db.Events.CountAsync(e => e.StartDate > DateTime.UtcNow);
        var confirmedBookings = _db.Bookings.Where(b => b.Status == BookingStatus.Confirmed);
        var totalBookings = await confirmedBookings.CountAsync();
        var ticketsSold = await confirmedBookings.SumAsync(b => (int?)b.Quantity) ?? 0;
        var totalRevenue = await confirmedBookings.SumAsync(b => (decimal?)b.TotalPrice) ?? 0;

        return Ok(new AdminStatsDto(totalUsers, totalEvents, upcomingEvents, totalBookings, ticketsSold, totalRevenue));
    }

    [HttpGet("events")]
    public async Task<ActionResult<List<EventDto>>> GetAllEvents()
    {
        var events = await _db.Events
            .Include(e => e.Category)
            .Include(e => e.Organizer)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EventDto(
                e.Id, e.Title, e.Description, e.Location, e.StartDate, e.EndDate,
                e.ImageUrl, e.Price, e.TotalTickets, e.AvailableTickets, e.CreatedAt,
                e.CategoryId, e.Category!.Name, e.OrganizerId, e.Organizer!.FullName, false))
            .ToListAsync();

        return Ok(events);
    }

    [HttpDelete("events/{id:guid}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);
        if (ev is null) return NotFound();

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetAllUsers()
    {
        var users = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto(
                u.Id, u.FullName, u.Email, u.Role, u.CreatedAt,
                u.Events.Count, u.Bookings.Count))
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = User.GetUserId();
        if (id == currentUserId)
        {
            return BadRequest(new { message = "You cannot delete your own admin account." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound();

        if (user.Role == UserRole.Admin)
        {
            return BadRequest(new { message = "Admin accounts cannot be deleted." });
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("bookings")]
    public async Task<ActionResult<List<AdminBookingDto>>> GetAllBookings()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Event)
            .Include(b => b.User)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new AdminBookingDto(
                b.Id, b.TicketCode, b.Quantity, b.TotalPrice, b.Status, b.BookingDate,
                b.Event!.Title, b.User!.FullName, b.User.Email))
            .ToListAsync();

        return Ok(bookings);
    }
}
