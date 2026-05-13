namespace CourtManagementBE.Domain.Entities;

public class UserToken
{
    public int Id { get; set; }
    public required string UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public string TokenType { get; set; } = string.Empty; // RefreshToken | ResetPassword | VerifyEmail

    public DateTime ExpiredAt { get; set; }

    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}