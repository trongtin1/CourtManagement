using System;
using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingHistories
{
    [Key]
    public long BookingHistoryID { get; set; }
    public Guid BookingID { get; set; }
    public string Action { get; set; } = string.Empty; // STATUS_UPDATE | PAYMENT | RESCHEDULE
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = "system";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation Property
    public Bookings? Booking { get; set; }
}
