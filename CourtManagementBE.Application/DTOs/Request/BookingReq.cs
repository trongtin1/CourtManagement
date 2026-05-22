using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int CustomerID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public int? BookingStatusID { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "pending";
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public int? CancellationReasonID { get; set; }
    [MaxLength(500)] public string CancellationReason { get; set; } = string.Empty;
}
