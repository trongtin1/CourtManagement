using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CancellationReasons : MasterDataBase
{
    [Key]
    public int CancellationReasonID { get; set; }

}
