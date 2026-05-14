using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateFacilityRequest
{
    [Required, MaxLength(200)] public string FacilityName { get; set; } = string.Empty;
    [MaxLength(500)] public string Address { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    public TimeSpan OpeningTime { get; set; } = new(6, 0, 0);
    public TimeSpan ClosingTime { get; set; } = new(22, 0, 0);
    [MaxLength(500)] public string ImageURL { get; set; } = string.Empty;
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateFacilityRequest
{
    [Required, MaxLength(200)] public string FacilityName { get; set; } = string.Empty;
    [MaxLength(500)] public string Address { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    public TimeSpan OpeningTime { get; set; }
    public TimeSpan ClosingTime { get; set; }
    [MaxLength(500)] public string ImageURL { get; set; } = string.Empty;
    [MaxLength(1000)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
