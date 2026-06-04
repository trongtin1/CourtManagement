using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class FacilityRequest
{
    [Required, MaxLength(200)] public string FacilityName { get; set; } = string.Empty;
    [MaxLength(500)] public string Address { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    [MaxLength(500)] public string ImageURL { get; set; } = string.Empty;
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
