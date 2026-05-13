using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class CourtPriceByTimeSlot
{
    [Key]
    public int ID { get; set; }
    public int CourtID { get; set; }
    public int TimeSlotID { get; set; }
    public int DayOfWeek { get; set; }    // 0 = Sunday, 1-5 = Weekday, 6 = Saturday
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
}
