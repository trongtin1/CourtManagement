namespace CourtManagementBE.Application.DTOs;

public class BookingComboResponse
{
    public int BookingComboID { get; set; }
    public Guid BookingID { get; set; }
    public int ComboID { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
