using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class PaymentMethods : MasterDataBase
{
    [Key]
    public int PaymentMethodID { get; set; }
    public bool IsOnline { get; set; }
}
