using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtAssets
{
    [Key]
    public int CourtAssetID { get; set; }
    public int CourtID { get; set; }
    public string AssetCode { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public int? AssetCategoryID { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int? UnitID { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int? AssetConditionID { get; set; }
    public string Condition { get; set; } = string.Empty;
    public DateTimeOffset? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public DateTimeOffset? LastMaintenanceDate { get; set; }
    public DateTimeOffset? NextMaintenanceDate { get; set; }
    public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
}
