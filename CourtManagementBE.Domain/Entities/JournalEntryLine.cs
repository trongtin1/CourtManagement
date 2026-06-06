using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class JournalEntryLine
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string JournalEntryId { get; set; } = string.Empty;

    public string AccountCode { get; set; } = string.Empty;

    public decimal DebitAmount { get; set; }

    public decimal CreditAmount { get; set; }

    public string? PartnerId { get; set; }

    public string Description { get; set; } = string.Empty;
}
