using System;

namespace CourtManagementBE.Application.DTOs;

public class CourtDefaultPriceRuleResponse
{
    public int CourtDefaultPriceRuleID { get; set; }
    public int? PriceRuleTypeID { get; set; }
    public int? DayOfWeek { get; set; }
    public DateTime? SpecificDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public bool IsMapping { get; set; }
    public bool IsLoadDefault { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset? UpdatedDate { get; set; }
}

