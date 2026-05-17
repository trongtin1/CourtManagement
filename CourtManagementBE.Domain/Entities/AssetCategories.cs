using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AssetCategories : MasterDataBase
{
    [Key]
    public int AssetCategoryID { get; set; }

}
