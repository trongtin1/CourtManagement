using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class PaymentStatuses : MasterDataBase
{
    [Key]
    public int PaymentStatusID { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
}
