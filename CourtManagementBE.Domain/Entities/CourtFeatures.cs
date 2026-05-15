using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtFeatures
{
    [Key]
    public int CourtFeatureID { get; set; }
    public string FeatureCode { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
