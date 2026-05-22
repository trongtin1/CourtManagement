using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtPriceRequest
{
    [Required] public int CourtID { get; set; }
    public int? PriceRuleTypeID { get; set; }
    [Required, Range(0, 6)] public int DayOfWeek { get; set; }
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
    [Required] public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
