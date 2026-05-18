using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Courts
{
    [Key]
    public int CourtID { get; set; }
    public int FacilityID { get; set; }
    public int CourtTypeID { get; set; }
    public string CourtCode { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public int StatusID { get; set; }          // FK → CourtStatus
    public float Length { get; set; }
    public float Width { get; set; }
    public int Capacity { get; set; }
    public int SortOrder { get; set; } = 0;   // thứ tự hiển thị
    public string Description { get; set; } = string.Empty;
    public string ImageURL { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
    public ICollection<CourtFeatureMappings> CourtFeatureMappings { get; set; } = new HashSet<CourtFeatureMappings>();
}
