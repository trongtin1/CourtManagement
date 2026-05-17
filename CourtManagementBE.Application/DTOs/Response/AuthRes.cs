namespace CourtManagementBE.Application.DTOs;

public class AuthUserResponse
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? FacilityID { get; set; }
    public List<string> Roles { get; set; } = [];
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public AuthUserResponse User { get; set; } = new();
}
