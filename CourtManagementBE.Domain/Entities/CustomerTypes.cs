using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CustomerTypes : MasterDataBase
{
    [Key]
    public int CustomerTypeID { get; set; }
    public decimal DiscountPercent { get; set; }
}
