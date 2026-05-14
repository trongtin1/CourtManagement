using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class TimeSlots
{
    [Key]
    public int TimeSlotID { get; set; }
    public string SlotName { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; }
}
