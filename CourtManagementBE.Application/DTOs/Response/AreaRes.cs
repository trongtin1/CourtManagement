namespace CourtManagementBE.Application.DTOs;

public class AreaResponse
{
    public int AreaID { get; set; }
    public int FacilityID { get; set; }
    public string AreaCode { get; set; } = string.Empty;
    public string AreaName { get; set; } = string.Empty;
    public double TotalLength { get; set; }
    public double TotalWidth { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; }
    public bool IsActive { get; set; }
}
