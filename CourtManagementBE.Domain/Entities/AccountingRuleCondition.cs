using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountingRuleCondition
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string RuleId { get; set; } = string.Empty;

    public string FieldName { get; set; } = string.Empty;

    public string Operator { get; set; } = string.Empty;

    public string ExpectedValue { get; set; } = string.Empty;

    public string LogicalGroup { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
