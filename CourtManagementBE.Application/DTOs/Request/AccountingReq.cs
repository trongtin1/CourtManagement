using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class JournalEntryQueryDto
{
    public string? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Keyword { get; set; }
}

public class JournalEntryUpdateDto
{
    public string? Description { get; set; }
    public List<JournalEntryLineUpdateDto> Lines { get; set; } = [];
}

public class JournalEntryLineUpdateDto
{
    public string? Id { get; set; }
    [Required, MaxLength(50)] public string AccountCode { get; set; } = string.Empty;
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public string? PartnerId { get; set; }
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
}

public class PostJournalEntriesRequestDto
{
    public List<string> EntryIds { get; set; } = [];
}

public class ChartOfAccountRequestDto
{
    [Required, MaxLength(50)] public string AccountCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string AccountName { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string AccountType { get; set; } = string.Empty;
    public string? ParentAccountId { get; set; }
    public int Level { get; set; }
    public bool IsActive { get; set; } = true;
}
