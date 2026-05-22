using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class PriceRuleTypes : MasterDataBase
{
    [Key]
    public int PriceRuleTypeID { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    [Required]
    public bool IsMapping { get; set; } = false;
    [Required]
    public bool IsLoadDefault { get; set; } = true;
}
