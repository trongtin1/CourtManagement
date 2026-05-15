using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtAssetRequest
{
    [Required] public int CourtID { get; set; }
    [Required, MaxLength(30)] public string AssetCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string AssetName { get; set; } = string.Empty;
    [MaxLength(50)] public string Category { get; set; } = string.Empty;
    [Range(0, int.MaxValue)] public int Quantity { get; set; }
    [MaxLength(50)] public string Unit { get; set; } = string.Empty;
    [MaxLength(30)] public string Condition { get; set; } = "Good";
    public DateTimeOffset? PurchaseDate { get; set; }
    [Range(0, double.MaxValue)] public decimal? PurchasePrice { get; set; }
    public DateTimeOffset? LastMaintenanceDate { get; set; }
    public DateTimeOffset? NextMaintenanceDate { get; set; }
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateCourtAssetRequest
{
    [Required, MaxLength(30)] public string AssetCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string AssetName { get; set; } = string.Empty;
    [MaxLength(50)] public string Category { get; set; } = string.Empty;
    [Range(0, int.MaxValue)] public int Quantity { get; set; }
    [MaxLength(50)] public string Unit { get; set; } = string.Empty;
    [MaxLength(30)] public string Condition { get; set; } = "Good";
    public DateTimeOffset? PurchaseDate { get; set; }
    [Range(0, double.MaxValue)] public decimal? PurchasePrice { get; set; }
    public DateTimeOffset? LastMaintenanceDate { get; set; }
    public DateTimeOffset? NextMaintenanceDate { get; set; }
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
