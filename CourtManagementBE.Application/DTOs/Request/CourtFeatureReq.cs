using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtFeatureRequest
{
    [Required, MaxLength(20)] public string FeatureCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string FeatureName { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string Category { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateCourtFeatureRequest
{
    [Required, MaxLength(20)] public string FeatureCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string FeatureName { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string Category { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
