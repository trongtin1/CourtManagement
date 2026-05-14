using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Bookings
{
    [Key]
    public Guid BookingID { get; set; } = Guid.NewGuid();
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty; // pending | confirmed | cancelled | completed
    public string Note { get; set; } = string.Empty;
    public string CancellationReason { get; set; } = string.Empty;
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
}
