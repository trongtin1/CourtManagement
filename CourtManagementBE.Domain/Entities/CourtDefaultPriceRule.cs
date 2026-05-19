using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtDefaultPriceRule
{
    [Key]
    public int CourtDefaultPriceRuleID { get; set; }
    public int? PriceRuleTypeID { get; set; }
    public int DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedDate { get; set; }
    public string? UpdatedBy { get; set; }
}
