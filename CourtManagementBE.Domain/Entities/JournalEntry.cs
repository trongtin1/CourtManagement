using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class JournalEntry
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string VoucherNo { get; set; } = string.Empty;

    public DateTime EntryDate { get; set; }

    public string DocumentType { get; set; } = string.Empty;

    public string SourceTable { get; set; } = string.Empty;

    public string SourceId { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}
