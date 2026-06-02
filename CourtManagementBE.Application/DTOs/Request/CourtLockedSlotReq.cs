using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtLockedSlotRequest
{
    [Required] public int CourtID { get; set; }
    [Range(0, 6)] public int? DayOfWeek { get; set; }
    public DateOnly? SpecificDate { get; set; }
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
    public bool IsWeekly { get; set; }
    public bool IsAllDay { get; set; }
    [Required, MaxLength(500)] public string LockReason { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
