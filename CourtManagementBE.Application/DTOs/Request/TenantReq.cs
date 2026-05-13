using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateTenantRequest
{
    [Required, MaxLength(200)]
    public string TenantName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Domain { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
}

public class UpdateTenantRequest
{
    [Required, MaxLength(200)]
    public string TenantName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Domain { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}
