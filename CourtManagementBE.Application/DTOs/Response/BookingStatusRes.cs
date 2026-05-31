namespace CourtManagementBE.Application.DTOs;

public class BookingStatusResponse
{
    public int BookingStatusID { get; set; }
    public string Code { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string LabelName { get; set; } = string.Empty;
    public bool IsTerminal { get; set; }
    public bool CanReschedule { get; set; }
    public bool CanCombo { get; set; }
    public bool CanService { get; set; }
    public string ColorCode { get; set; } = string.Empty;
}
