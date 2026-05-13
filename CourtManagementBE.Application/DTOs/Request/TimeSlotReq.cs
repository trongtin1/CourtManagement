using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateTimeSlotRequest
{
    [Required] public int TenantID { get; set; }
    [Required, MaxLength(100)] public string SlotName { get; set; } = string.Empty;
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateTimeSlotRequest
{
    [Required, MaxLength(100)] public string SlotName { get; set; } = string.Empty;
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; }
}
