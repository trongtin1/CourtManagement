using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateBookingSlotRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public int CourtID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    [Required] public int TimeSlotID { get; set; }
}
