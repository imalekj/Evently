namespace Evently.Api.Models;

public enum BookingStatus
{
    Confirmed,
    Cancelled
}

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TicketCode { get; set; } = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public string? StripeSessionId { get; set; }
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;

    public Guid EventId { get; set; }
    public Event? Event { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }
}
