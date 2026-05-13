using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtRequest
{
    [Required] public int FacilityID { get; set; }
    public int? AreaID { get; set; }
    [Required] public int CourtTypeID { get; set; }
    [Required, MaxLength(20)] public string CourtCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string CourtName { get; set; } = string.Empty;
    [Required] public int StatusID { get; set; }
    public float Length { get; set; }
    public float Width { get; set; }
    public int Capacity { get; set; }
    public int SortOrder { get; set; }
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    [MaxLength(500)] public string ImageURL { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateCourtRequest
{
    public int? AreaID { get; set; }
    [Required] public int CourtTypeID { get; set; }
    [Required, MaxLength(20)] public string CourtCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string CourtName { get; set; } = string.Empty;
    [Required] public int StatusID { get; set; }
    public float Length { get; set; }
    public float Width { get; set; }
    public int Capacity { get; set; }
    public int SortOrder { get; set; }
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    [MaxLength(500)] public string ImageURL { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
