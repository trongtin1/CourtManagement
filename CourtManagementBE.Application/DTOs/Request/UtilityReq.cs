using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class UtilityRequest
{
    [Required, MaxLength(20)] public string UtilityCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string UtilityName { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    [MaxLength(100)] public string Icon { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
