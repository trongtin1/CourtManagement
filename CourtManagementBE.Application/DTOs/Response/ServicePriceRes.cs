namespace CourtManagementBE.Application.DTOs;

public class ServicePriceResponse
{
    public int ID { get; set; }
    public int ServiceID { get; set; }
    public decimal Price { get; set; }
    public DateTimeOffset EffectiveDate { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}
