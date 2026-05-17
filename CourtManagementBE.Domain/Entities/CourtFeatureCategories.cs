using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtFeatureCategories : MasterDataBase
{
    [Key]
    public int CourtFeatureCategoryID { get; set; }

}
