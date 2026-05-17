using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Units : MasterDataBase
{
    [Key]
    public int UnitID { get; set; }
    public string Symbol { get; set; } = string.Empty;
}
