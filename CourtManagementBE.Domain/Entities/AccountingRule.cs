using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountingRule
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string TransactionType { get; set; } = string.Empty;

    public string DebitAccount { get; set; } = string.Empty;

    public string CreditAccount { get; set; } = string.Empty;

    public string OriginalSource { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}
