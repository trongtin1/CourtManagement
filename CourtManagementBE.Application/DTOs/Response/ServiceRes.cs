namespace CourtManagementBE.Application.DTOs;

public class ServiceResponse
{
    public int ServiceID { get; set; }
    public int TenantID { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public DateTimeOffset CreateDate { get; set; }
    public bool IsActive { get; set; }
}
