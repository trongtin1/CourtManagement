namespace CourtManagementBE.Application.DTOs;

public class BookingSlotResponse
{
    public int ID { get; set; }
    public Guid BookingID { get; set; }
    public int CourtID { get; set; }
    public DateTime BookingDate { get; set; }
    public int TimeSlotID { get; set; }
}
