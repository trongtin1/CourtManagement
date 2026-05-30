using System;

namespace CourtManagementBE.Application.DTOs.Response;

public class BookingHistoryResponse
{
    public long BookingHistoryID { get; set; }
    public Guid BookingID { get; set; }
    public string Action { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
