using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Areas
{
    [Key]
    public int AreaID { get; set; }
    public int FacilityID { get; set; }
    public string AreaCode { get; set; } = string.Empty;
    public string AreaName { get; set; } = string.Empty;
    public double TotalLength { get; set; }
    public double TotalWidth { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public bool IsActive { get; set; } = true;
}
