using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class ServicePriceRequest
{
    [Required] public int ServiceID { get; set; }
    [Required] public decimal Price { get; set; }
    [Required] public DateTimeOffset EffectiveDate { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
}
