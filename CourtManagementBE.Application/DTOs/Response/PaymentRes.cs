namespace CourtManagementBE.Application.DTOs;

public class PaymentResponse
{
    public int PaymentID { get; set; }
    public Guid? BookingID { get; set; }
    public int? BookingGroupID { get; set; }
    public decimal Amount { get; set; }
    public decimal RefundedAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
