using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class RefundReasons : MasterDataBase
{
    [Key]
    public int RefundReasonID { get; set; }

}
