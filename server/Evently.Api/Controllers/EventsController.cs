using Evently.Api.Data;
using Evently.Api.DTOs;
using Evently.Api.Models;
using Evently.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Evently.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid? CurrentUserIdOrNull()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return idClaim is null ? null : Guid.Parse(idClaim);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<EventDto>>> GetAll([FromQuery] EventQueryParams query)
    {
        var currentUserId = CurrentUserIdOrNull();
        var q = _db.Events.Include(e => e.Category).Include(e => e.Organizer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(e => e.Title.ToLower().Contains(term) || e.Description.ToLower().Contains(term));
        }

        if (query.CategoryId.HasValue)
        {
            q = q.Where(e => e.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Location))
        {
            var loc = query.Location.Trim().ToLower();
            q = q.Where(e => e.Location.ToLower().Contains(loc));
        }

        if (query.FromDate.HasValue)
        {
            q = q.Where(e => e.StartDate >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            q = q.Where(e => e.StartDate <= query.ToDate.Value);
        }

        if (query.MinPrice.HasValue)
        {
            q = q.Where(e => e.Price >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            q = q.Where(e => e.Price <= query.MaxPrice.Value);
        }

        q = query.SortBy switch
        {
            "price_asc" => q.OrderBy(e => e.Price),
            "price_desc" => q.OrderByDescending(e => e.Price),
            "newest" => q.OrderByDescending(e => e.CreatedAt),
            _ => q.OrderBy(e => e.StartDate)
        };

        var totalCount = await q.CountAsync();
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 12 : query.PageSize;

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EventDto(
                e.Id, e.Title, e.Description, e.Location, e.StartDate, e.EndDate,
                e.ImageUrl, e.Price, e.TotalTickets, e.AvailableTickets, e.CreatedAt,
                e.CategoryId, e.Category!.Name, e.OrganizerId, e.Organizer!.FullName,
                currentUserId != null && e.OrganizerId == currentUserId))
            .ToListAsync();

        return Ok(new PagedResult<EventDto>(items, totalCount, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EventDto>> GetById(Guid id)
    {
        var currentUserId = CurrentUserIdOrNull();
        var e = await _db.Events.Include(x => x.Category).Include(x => x.Organizer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e is null) return NotFound();

        return Ok(new EventDto(
            e.Id, e.Title, e.Description, e.Location, e.StartDate, e.EndDate,
            e.ImageUrl, e.Price, e.TotalTickets, e.AvailableTickets, e.CreatedAt,
            e.CategoryId, e.Category!.Name, e.OrganizerId, e.Organizer!.FullName,
            currentUserId != null && e.OrganizerId == currentUserId));
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<EventDto>>> GetMyEvents()
    {
        var userId = User.GetUserId();
        var items = await _db.Events
            .Include(e => e.Category).Include(e => e.Organizer)
            .Where(e => e.OrganizerId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EventDto(
                e.Id, e.Title, e.Description, e.Location, e.StartDate, e.EndDate,
                e.ImageUrl, e.Price, e.TotalTickets, e.AvailableTickets, e.CreatedAt,
                e.CategoryId, e.Category!.Name, e.OrganizerId, e.Organizer!.FullName, true))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<EventDto>> Create(EventCreateDto dto)
    {
        if (dto.EndDate < dto.StartDate)
        {
            return BadRequest(new { message = "End date must be after the start date." });
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest(new { message = "Category not found." });

        var userId = User.GetUserId();
        var ev = new Event
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CategoryId = dto.CategoryId,
            Location = dto.Location.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ImageUrl = dto.ImageUrl,
            Price = dto.Price,
            TotalTickets = dto.TotalTickets,
            AvailableTickets = dto.TotalTickets,
            OrganizerId = userId
        };

        _db.Events.Add(ev);
        await _db.SaveChangesAsync();

        await _db.Entry(ev).Reference(e => e.Category).LoadAsync();
        await _db.Entry(ev).Reference(e => e.Organizer).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = ev.Id }, new EventDto(
            ev.Id, ev.Title, ev.Description, ev.Location, ev.StartDate, ev.EndDate,
            ev.ImageUrl, ev.Price, ev.TotalTickets, ev.AvailableTickets, ev.CreatedAt,
            ev.CategoryId, ev.Category!.Name, ev.OrganizerId, ev.Organizer!.FullName, true));
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<EventDto>> Update(Guid id, EventUpdateDto dto)
    {
        var ev = await _db.Events.Include(e => e.Category).Include(e => e.Organizer)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (ev is null) return NotFound();

        var userId = User.GetUserId();
        if (ev.OrganizerId != userId) return Forbid();

        if (dto.EndDate < dto.StartDate)
        {
            return BadRequest(new { message = "End date must be after the start date." });
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest(new { message = "Category not found." });

        var ticketsSold = ev.TotalTickets - ev.AvailableTickets;
        if (dto.TotalTickets < ticketsSold)
        {
            return BadRequest(new { message = $"Total tickets cannot be less than {ticketsSold} (tickets already sold)." });
        }

        ev.Title = dto.Title.Trim();
        ev.Description = dto.Description.Trim();
        ev.CategoryId = dto.CategoryId;
        ev.Location = dto.Location.Trim();
        ev.StartDate = dto.StartDate;
        ev.EndDate = dto.EndDate;
        ev.ImageUrl = dto.ImageUrl;
        ev.Price = dto.Price;
        ev.AvailableTickets = dto.TotalTickets - ticketsSold;
        ev.TotalTickets = dto.TotalTickets;

        await _db.SaveChangesAsync();
        await _db.Entry(ev).Reference(e => e.Category).LoadAsync();

        return Ok(new EventDto(
            ev.Id, ev.Title, ev.Description, ev.Location, ev.StartDate, ev.EndDate,
            ev.ImageUrl, ev.Price, ev.TotalTickets, ev.AvailableTickets, ev.CreatedAt,
            ev.CategoryId, ev.Category!.Name, ev.OrganizerId, ev.Organizer!.FullName, true));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);
        if (ev is null) return NotFound();

        var userId = User.GetUserId();
        if (ev.OrganizerId != userId) return Forbid();

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
