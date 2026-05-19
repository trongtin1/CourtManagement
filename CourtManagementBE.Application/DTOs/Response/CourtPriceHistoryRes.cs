namespace CourtManagementBE.Application.DTOs;

public class CourtPriceHistoryResponse
{
    public int CourtPriceRuleHistoryID { get; set; }
    public int CourtPriceRuleID { get; set; }
    public int CourtID { get; set; }
    public int? OldPriceRuleTypeID { get; set; }
    public int? NewPriceRuleTypeID { get; set; }
    public int DayOfWeek { get; set; }
    public TimeSpan OldStartTime { get; set; }
    public TimeSpan OldEndTime { get; set; }
    public decimal OldPrice { get; set; }
    public TimeSpan NewStartTime { get; set; }
    public TimeSpan NewEndTime { get; set; }
    public decimal NewPrice { get; set; }
    public DateTimeOffset ChangeDate { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
