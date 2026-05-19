using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class PriceRuleTypes : MasterDataBase
{
    [Key]
    public int PriceRuleTypeID { get; set; }
    public string ColorCode { get; set; } = string.Empty;
}
