namespace CourtManagementBE.Application.DTOs;

public class BookingServiceResponse
{
    public int BookingServiceID { get; set; }
    public Guid BookingID { get; set; }
    public int ServiceID { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
