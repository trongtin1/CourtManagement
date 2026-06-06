using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class ChartOfAccount
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string AccountCode { get; set; } = string.Empty;     // 111,112,131

    public string AccountName { get; set; } = string.Empty;     // Cash, Bank...

    public string AccountType { get; set; } = string.Empty;     // Asset, Liability...

    public string? ParentAccountId { get; set; }

    public int Level { get; set; }

    public bool IsActive { get; set; } = true;
}
