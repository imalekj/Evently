using Evently.Api.Models;

namespace Evently.Api.DTOs;

public record AdminStatsDto(
    int TotalUsers,
    int TotalEvents,
    int UpcomingEvents,
    int TotalBookings,
    int TicketsSold,
    decimal TotalRevenue
);

public record AdminUserDto(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    DateTime CreatedAt,
    int EventsCount,
    int BookingsCount
);

public record AdminBookingDto(
    Guid Id,
    string TicketCode,
    int Quantity,
    decimal TotalPrice,
    BookingStatus Status,
    DateTime BookingDate,
    string EventTitle,
    string UserFullName,
    string UserEmail
);
