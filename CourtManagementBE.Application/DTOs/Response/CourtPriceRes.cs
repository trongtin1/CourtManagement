namespace CourtManagementBE.Application.DTOs;

public class CourtPriceResponse
{
    public int ID { get; set; }
    public int CourtID { get; set; }
    public int TimeSlotID { get; set; }
    public int DayOfWeek { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
