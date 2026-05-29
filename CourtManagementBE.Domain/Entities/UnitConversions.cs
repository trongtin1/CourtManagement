using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CourtManagementBE.Domain.Entities;

public class UnitConversions
{
    [Key]
    public int UnitConversionID { get; set; }

    public int? ServiceID { get; set; }
    [ForeignKey("ServiceID")]
    public Services? Service { get; set; }

    public int SourceUnitID { get; set; }
    [ForeignKey("SourceUnitID")]
    public Units SourceUnit { get; set; } = null!;

    public int TargetUnitID { get; set; }
    [ForeignKey("TargetUnitID")]
    public Units TargetUnit { get; set; } = null!;

    [Column(TypeName = "decimal(18, 4)")]
    public decimal Factor { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
}
