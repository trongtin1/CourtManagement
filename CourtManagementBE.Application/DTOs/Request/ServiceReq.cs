using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateServiceRequest
{
    [Required] public int TenantID { get; set; }
    [Required, MaxLength(20)] public string ServiceCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string ServiceName { get; set; } = string.Empty;
    [MaxLength(50)] public string ServiceType { get; set; } = string.Empty;
    [MaxLength(50)] public string Unit { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateServiceRequest
{
    [Required, MaxLength(20)] public string ServiceCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string ServiceName { get; set; } = string.Empty;
    [MaxLength(50)] public string ServiceType { get; set; } = string.Empty;
    [MaxLength(50)] public string Unit { get; set; } = string.Empty;
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public bool IsActive { get; set; }
}
