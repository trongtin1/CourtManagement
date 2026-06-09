using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountingRule
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string RuleName { get; set; } = string.Empty;

    public string TransactionType { get; set; } = string.Empty;

    public string SourceTable { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Priority { get; set; }

    public bool IsActive { get; set; } = true;
}
