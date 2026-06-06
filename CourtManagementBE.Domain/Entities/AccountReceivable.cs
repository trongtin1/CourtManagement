using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class AccountReceivable
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string PartnerId { get; set; } = string.Empty;

    public decimal OriginalAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal OutstandingAmount { get; set; }

    public DateTime DueDate { get; set; }

    public string Status { get; set; } = string.Empty;
}
