using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtPriceHistory
{
    [Key]
    public int CourtPriceHistoryID { get; set; }
    public int CourtPriceByTimeSlotID { get; set; }   // FK → CourtPriceByTimeSlot.ID (track đúng slot nào thay đổi)
    public int CourtID { get; set; }                   // denorm để query nhanh
    public int TimeSlotID { get; set; }                // denorm để query nhanh
    public int DayOfWeek { get; set; }                 // denorm để query nhanh
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public DateTimeOffset ChangeDate { get; set; } = DateTimeOffset.UtcNow;
    public string ChangedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
