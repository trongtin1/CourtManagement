using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateBookingRequest
{
    [Required] public int TenantID { get; set; }
    [Required] public int CourtID { get; set; }
    [Required] public int CustomerID { get; set; }
    [Required] public DateTime BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "pending";
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
}

public class UpdateBookingRequest
{
    [Required, MaxLength(20)] public string Status { get; set; } = string.Empty;
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    [MaxLength(500)] public string CancellationReason { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}

public class CancelBookingRequest
{
    [Required, MaxLength(500)] public string CancellationReason { get; set; } = string.Empty;
}
