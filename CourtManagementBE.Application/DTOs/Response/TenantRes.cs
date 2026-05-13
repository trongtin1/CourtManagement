namespace CourtManagementBE.Application.DTOs;

public class TenantResponse
{
    public int TenantID { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; }
}
