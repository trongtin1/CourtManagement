using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountingRuleLine
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string RuleId { get; set; } = string.Empty;

    public string AccountCode { get; set; } = string.Empty;

    public string EntryType { get; set; } = string.Empty;

    public string ValueSource { get; set; } = string.Empty;

    public string DescriptionTemplate { get; set; } = string.Empty;
}
