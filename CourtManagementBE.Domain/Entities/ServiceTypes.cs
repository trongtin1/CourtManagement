using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class ServiceTypes : MasterDataBase
{
    [Key]
    public int ServiceTypeID { get; set; }

}
