using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtStatusRequest
{
    [Required, MaxLength(20)] public string StatusCode { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string StatusName { get; set; } = string.Empty;
    [MaxLength(10)] public string ColorCode { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
