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
    public ServiceTypes ServiceType { get; set; } = null!;
    public int? UnitID { get; set; }
    public string Unit { get; set; } = string.Empty;
    public Units? BaseUnit { get; set; }

    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }

    public bool IsTrackStock { get; set; } = false;
    public int StockQuantity { get; set; } = 0;

    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public decimal Price { get; set; }

    public ICollection<UnitConversions> UnitConversions { get; set; } = new List<UnitConversions>();

}
