using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Facilities
{
    [Key]
    public int FacilityID { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public TimeSpan OpeningTime { get; set; } = new TimeSpan(6, 0, 0);  // default 06:00
    public TimeSpan ClosingTime { get; set; } = new TimeSpan(22, 0, 0); // default 22:00
    public string ImageURL { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
    public bool IsActive { get; set; } = true;
}
