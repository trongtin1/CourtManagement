using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtFeatureMappings
{
    [Key]
    public int CourtFeatureMappingID { get; set; }
    public int CourtID { get; set; }
    public int CourtFeatureID { get; set; }
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;

    public Courts Court { get; set; } = null!;
    public CourtFeatures CourtFeature { get; set; } = null!;
}
