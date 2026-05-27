using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class ServicePrice
{
    [Key]
    public int ID { get; set; }
    public int ServiceID { get; set; }
    public decimal Price { get; set; }
    public DateTimeOffset EffectiveDate { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ExpiryDate { get; set; }    // null = còn hiệu lực, có giá trị = đã hết hạn
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;

    public Services Service { get; set; } = null!;
}
