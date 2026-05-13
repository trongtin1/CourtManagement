namespace CourtManagementBE.Application.DTOs;

public class CourtStatusResponse
{
    public int StatusID { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; }
    public bool IsActive { get; set; }
}
