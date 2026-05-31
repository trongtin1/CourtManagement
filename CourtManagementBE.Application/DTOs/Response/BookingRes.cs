namespace CourtManagementBE.Application.DTOs;

public class BookingResponse
{
    public Guid BookingID { get; set; }
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public int? ComboID { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public int? CancellationReasonID { get; set; }
    public string CancellationReason { get; set; } = string.Empty;
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}

public class BookingStatusOption
{
    public string Value { get; set; } = string.Empty; // Keep as StatusName (e.g. "Pending") to maintain compatibility
    public string Code { get; set; } = string.Empty;  // "001"
    public string Label { get; set; } = string.Empty; // LabelName
    public bool IsTerminal { get; set; }
    public bool CanReschedule { get; set; }
    public string ColorCode { get; set; } = string.Empty;
}

