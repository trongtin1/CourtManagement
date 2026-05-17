using System.ComponentModel.DataAnnotations;
using CourtManagementBE.Application.Common;

namespace CourtManagementBE.Application.DTOs;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public int? FacilityID { get; set; }

    public string Role { get; set; } = CurrentUserContext.FacilityManagerRole;
}

public class LoginRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
