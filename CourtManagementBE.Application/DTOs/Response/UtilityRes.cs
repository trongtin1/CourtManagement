namespace CourtManagementBE.Application.DTOs;

public class UtilityResponse
{
    public int UtilityID { get; set; }
    public string UtilityCode { get; set; } = string.Empty;
    public string UtilityName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; }
    public bool IsActive { get; set; }
}
