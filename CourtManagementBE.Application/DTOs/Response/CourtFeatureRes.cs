namespace CourtManagementBE.Application.DTOs;

public class CourtFeatureResponse
{
    public int CourtFeatureID { get; set; }
    public string FeatureCode { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public int? CourtFeatureCategoryID { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
