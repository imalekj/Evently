using System.ComponentModel.DataAnnotations;
using Evently.Api.Models;

namespace Evently.Api.DTOs;

public record BookingCreateDto(
    [Required] Guid EventId,
    [Range(1, 100)] int Quantity
);

public record BookingDto(
    Guid Id,
    string TicketCode,
    int Quantity,
    decimal TotalPrice,
    BookingStatus Status,
    DateTime BookingDate,
    Guid EventId,
    string EventTitle,
    string? EventImageUrl,
    DateTime EventStartDate,
    string EventLocation
);

public record CategoryDto(int Id, string Name);
