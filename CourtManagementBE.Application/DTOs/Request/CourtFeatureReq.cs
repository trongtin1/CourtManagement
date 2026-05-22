using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtFeatureRequest
{
    [Required, MaxLength(20)] public string FeatureCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string FeatureName { get; set; } = string.Empty;
    [Required] public int CourtFeatureCategoryID { get; set; }
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
