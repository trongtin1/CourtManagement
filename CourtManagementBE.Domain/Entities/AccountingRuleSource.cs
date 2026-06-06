using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountingRuleSource
{
    [Key]
    public int Id { get; set; }

    public string RuleId { get; set; } = string.Empty;

    public string SourceTable { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedBy { get; set; } = string.Empty;
}
