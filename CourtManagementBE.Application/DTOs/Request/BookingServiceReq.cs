using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingServiceRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public int ServiceID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "pending";
}
