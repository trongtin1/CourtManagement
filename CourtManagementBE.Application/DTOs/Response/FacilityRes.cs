namespace CourtManagementBE.Application.DTOs;

public class FacilityResponse
{
    public int FacilityID { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public TimeSpan OpeningTime { get; set; }
    public TimeSpan ClosingTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public string ImageURL { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; }
    public bool IsActive { get; set; }
}
