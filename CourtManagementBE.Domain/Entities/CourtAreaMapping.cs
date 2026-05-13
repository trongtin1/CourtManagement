using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtAreaMapping
{
    [Key]
    public int CourtAreaMappingID { get; set; }
    public int CourtID { get; set; }
    public int AreaID { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public int DisplayOrder { get; set; }
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
}
