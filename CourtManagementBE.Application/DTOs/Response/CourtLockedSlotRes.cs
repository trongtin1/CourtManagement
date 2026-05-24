namespace CourtManagementBE.Application.DTOs;

public class CourtLockedSlotResponse
{
    public int CourtLockedSlotID { get; set; }
    public int CourtID { get; set; }
    public int? DayOfWeek { get; set; }
    public DateTime? SpecificDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsWeekly { get; set; }
    public bool IsAllDay { get; set; }
    public string LockReason { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset? UpdatedDate { get; set; }
}
