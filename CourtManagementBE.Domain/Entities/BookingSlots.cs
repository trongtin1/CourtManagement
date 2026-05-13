using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingSlots
{
    [Key]
    public int ID { get; set; }
    public Guid BookingID { get; set; }  // FK → Bookings.BookingID
    public int CourtID { get; set; }
    public DateTime BookingDate { get; set; }
    public int TimeSlotID { get; set; }
}
