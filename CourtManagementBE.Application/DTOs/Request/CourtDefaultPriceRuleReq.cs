using System;
using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtDefaultPriceRuleRequest
{
    public int? PriceRuleTypeID { get; set; }
    public int? DayOfWeek { get; set; }
    public DateTime? SpecificDate { get; set; }
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
    [Required] public decimal Price { get; set; }
    public bool IsMapping { get; set; } = false;
    public bool IsLoadDefault { get; set; } = true;
    public bool IsActive { get; set; } = true;
}


