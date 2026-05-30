namespace CourtManagementBE.Application.DTOs;

public class ServiceResponse
{
    public int ServiceID { get; set; }
    public int? FacilityID { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public int? ServiceTypeID { get; set; }
    public ServiceTypeResponse? ServiceType { get; set; }
    public int? UnitID { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public bool IsTrackStock { get; set; }
    public int StockQuantity { get; set; }
    public DateTimeOffset CreateDate { get; set; }
    public bool IsActive { get; set; }
    public decimal Price { get; set; }
}
