using CourtManagementBE.Domain.Abstractions.Base;

namespace CourtManagementBE.Domain.Entities;

public class User : EntityTrackable<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "SuperAdmin";
    public int? FacilityID { get; set; }
}
