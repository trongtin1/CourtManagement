using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class AreaRequest
{
    [Required] public int FacilityID { get; set; }
    [Required, MaxLength(20)] public string AreaCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string AreaName { get; set; } = string.Empty;
    public double TotalLength { get; set; }
    public double TotalWidth { get; set; }
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}


