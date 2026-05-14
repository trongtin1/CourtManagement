namespace CourtManagementBE.Application.DTOs;

public class CourtResponse
{
    public int CourtID { get; set; }
    public int FacilityID { get; set; }
    public int CourtTypeID { get; set; }
    public string CourtCode { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public int StatusID { get; set; }
    public float Length { get; set; }
    public float Width { get; set; }
    public int Capacity { get; set; }
    public int SortOrder { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageURL { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}
