namespace CourtManagementBE.Application.DTOs;

public class BookingResponse
{
    public Guid BookingID { get; set; }
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public int? BookingStatusID { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public int? CancellationReasonID { get; set; }
    public string CancellationReason { get; set; } = string.Empty;
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
