using System.ComponentModel.DataAnnotations;

namespace Evently.Api.DTOs;

public record EventCreateDto(
    [Required, MaxLength(200)] string Title,
    [Required] string Description,
    [Required] int CategoryId,
    [Required, MaxLength(250)] string Location,
    [Required] DateTime StartDate,
    [Required] DateTime EndDate,
    string? ImageUrl,
    [Range(0, 1000000)] decimal Price,
    [Range(1, 1000000)] int TotalTickets
);

public record EventUpdateDto(
    [Required, MaxLength(200)] string Title,
    [Required] string Description,
    [Required] int CategoryId,
    [Required, MaxLength(250)] string Location,
    [Required] DateTime StartDate,
    [Required] DateTime EndDate,
    string? ImageUrl,
    [Range(0, 1000000)] decimal Price,
    [Range(1, 1000000)] int TotalTickets
);

public record EventDto(
    Guid Id,
    string Title,
    string Description,
    string Location,
    DateTime StartDate,
    DateTime EndDate,
    string? ImageUrl,
    decimal Price,
    int TotalTickets,
    int AvailableTickets,
    DateTime CreatedAt,
    int CategoryId,
    string CategoryName,
    Guid OrganizerId,
    string OrganizerName,
    bool IsOwner
);

public record EventQueryParams
{
    public string? Search { get; init; }
    public int? CategoryId { get; init; }
    public string? Location { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public string? SortBy { get; init; } = "date";
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 12;
}

public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
