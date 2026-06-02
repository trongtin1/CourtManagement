using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtLockedSlot
{
    [Key]
    public int CourtLockedSlotID { get; set; }
    public int CourtID { get; set; }
    public int? DayOfWeek { get; set; }
    public DateOnly? SpecificDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsWeekly { get; set; }
    public bool IsAllDay { get; set; }
    public string LockReason { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }

    public Courts? Court { get; set; }
}
