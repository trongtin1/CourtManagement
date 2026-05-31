using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingCombos
{
    [Key]
    public int BookingComboID { get; set; }
    public Guid BookingID { get; set; }    // FK → Bookings.BookingID
    public int ComboID { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
}
