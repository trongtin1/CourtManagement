using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtUtilities
{
    [Key]
    public int CourtUtilitiesID { get; set; }
    public int CourtID { get; set; }
    public int UtilityID { get; set; }
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}