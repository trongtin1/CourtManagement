using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AssetConditions : MasterDataBase
{
    [Key]
    public int AssetConditionID { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool IsUsable { get; set; } = true;
}
