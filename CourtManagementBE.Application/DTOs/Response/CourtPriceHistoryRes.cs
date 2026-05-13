namespace CourtManagementBE.Application.DTOs;

public class CourtPriceHistoryResponse
{
    public int CourtPriceHistoryID { get; set; }
    public int CourtPriceByTimeSlotID { get; set; }
    public int CourtID { get; set; }
    public int TimeSlotID { get; set; }
    public int DayOfWeek { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public DateTimeOffset ChangeDate { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
