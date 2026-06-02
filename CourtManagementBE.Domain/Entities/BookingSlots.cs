using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingSlots
{
    [Key]
    public int ID { get; set; }
    public Guid BookingID { get; set; }  // FK → Bookings.BookingID
    public int CourtID { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
