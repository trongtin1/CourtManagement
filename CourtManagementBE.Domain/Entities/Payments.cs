using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Payments
{
    [Key]
    public int PaymentID { get; set; }
    public Guid? BookingID { get; set; }          // FK → Bookings.BookingID (nullable)
    public int? BookingGroupID { get; set; }       // FK → BookingGroups.BookingGroupID (nullable, for group deposit pool)
    public decimal Amount { get; set; }
    public decimal RefundedAmount { get; set; } = 0;
    public string PaymentMethod { get; set; } = string.Empty;  // cash | bank_transfer | qr
    public string Status { get; set; } = "success";            // pending | success | failed | refunded
    public string Note { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;

    // Navigation properties
    public BookingGroups? BookingGroup { get; set; }
}
