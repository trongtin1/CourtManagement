using System;
using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Combos
{
    [Key]
    public int ComboID { get; set; }

    [Required, MaxLength(50)]
    public string ComboCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string ComboName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public decimal ComboPrice { get; set; }

    public int DurationHours { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
}
