using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int CustomerID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public int? ComboID { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "pending";
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public int? CancellationReasonID { get; set; }
    [MaxLength(500)] public string CancellationReason { get; set; } = string.Empty;
}

public class CreateFullBookingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int CustomerID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    public int? ComboID { get; set; }
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public List<CreateFullBookingSlotRequest> Slots { get; set; } = [];
    public List<CreateFullBookingServiceRequest> Services { get; set; } = [];
}

public class CreateFullBookingSlotRequest
{
    [Required] public TimeSpan StartTime { get; set; }
    [Required] public TimeSpan EndTime { get; set; }
}

public class CreateFullBookingServiceRequest
{
    [Required] public int ServiceID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
}

public class RescheduleBookingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    public List<CreateFullBookingSlotRequest> Slots { get; set; } = [];
}
