using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingServices
{
    [Key]
    public int BookingServiceID { get; set; }
    public Guid BookingID { get; set; }    // FK → Bookings.BookingID
    public int ServiceID { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
}
