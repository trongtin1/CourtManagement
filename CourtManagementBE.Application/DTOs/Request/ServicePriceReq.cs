using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateServicePriceRequest
{
    [Required] public int ServiceID { get; set; }
    [Required] public decimal Price { get; set; }
    [Required] public DateTimeOffset EffectiveDate { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
}

public class UpdateServicePriceRequest
{
    [Required] public decimal Price { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
}
