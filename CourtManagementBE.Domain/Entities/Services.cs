using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Services
{
    [Key]
    public int ServiceID { get; set; }
    public int? FacilityID { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public int? ServiceTypeID { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public int? UnitID { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<ServicePrice> ServicePrices { get; set; } = new List<ServicePrice>();

}
