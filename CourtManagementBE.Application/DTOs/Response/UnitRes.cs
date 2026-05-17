namespace CourtManagementBE.Application.DTOs;

public class UnitResponse
{
    public int UnitID { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public string Symbol { get; set; } = string.Empty;
}
