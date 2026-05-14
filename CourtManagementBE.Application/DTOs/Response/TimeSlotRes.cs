namespace CourtManagementBE.Application.DTOs;

public class TimeSlotResponse
{
    public int TimeSlotID { get; set; }
    public string SlotName { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; }
}
