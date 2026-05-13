using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Utilities
{
    [Key]
    public int UtilityID { get; set; }
    public string UtilityCode { get; set; } = string.Empty;
    public string UtilityName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
