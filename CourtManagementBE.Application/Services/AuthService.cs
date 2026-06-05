using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Domain.Common;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class AuthService : BaseService, IAuthService
{
    private readonly ILogger<AuthService> _logger;

    private readonly JwtSettings _jwt;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<JwtSettings> jwt, ILogger<AuthService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
        _jwt = jwt.Value;
    }

    // ── Register ──────────────────────────────────────────────
    public async Task<Result<AuthResponse>> Register(RegisterRequest request, HttpContext httpContext)
    {
        const string loggingHeader = "Đăng ký tài khoản auth";

        var userRepo = _unitOfWork.IAuthRepository;

        var existingUser = await userRepo.FindFirst(u => u.Email == request.Email);
        if (existingUser is not null)
            { _logger.LogWarning($"{loggingHeader} - {("Email đã tồn tại.")}"); return Conflict<AuthResponse>("Email đã tồn tại."); }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FacilityID = request.FacilityID,
            Role = string.IsNullOrWhiteSpace(request.Role)
                ? CurrentUserContext.FacilityManagerRole
                : request.Role
        };

        await userRepo.Add(user);
        await _unitOfWork.SaveChangesAsync();

        var tokens = await GenerateTokens(user, httpContext);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(tokens); }
    }




    // ── Login ─────────────────────────────────────────────────
    public async Task<Result<AuthResponse>> Login(LoginRequest request, HttpContext httpContext)
    {
        const string loggingHeader = "Đăng nhập auth";

        var userRepo = _unitOfWork.IAuthRepository;

        var user = await userRepo.FindFirst(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            { _logger.LogWarning($"{loggingHeader} - {("Email hoặc mật khẩu không đúng.")}"); return Unauthorized<AuthResponse>("Email hoặc mật khẩu không đúng."); }

        var tokens = await GenerateTokens(user, httpContext);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(tokens); }
    }

    public async Task<Result<AuthUserResponse>> GetCurrentUser(HttpContext httpContext)
    {
        const string loggingHeader = "Lấy người dùng hiện tại auth";
        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var id))
            { _logger.LogWarning($"{loggingHeader} - {("Không xác định")}"); return Unauthorized<AuthUserResponse>(); }

        var user = await _unitOfWork.IAuthRepository.FindFirst(u => u.Id == id);
        if (user is null)
            { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy người dùng.")}"); return NotFound<AuthUserResponse>("Không tìm thấy người dùng."); }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(ToAuthUserResponse(user)); }
    }




    // ── Logout ────────────────────────────────────────────────
    public async Task<Result<bool>> Logout(HttpContext httpContext)
    {
        const string loggingHeader = "Đăng xuất auth";

        var refreshToken = httpContext.Request.Cookies["refreshToken"];

        if (!string.IsNullOrEmpty(refreshToken))
        {
            var tokenRepo = _unitOfWork.IUserTokenRepository;
            var userToken = await tokenRepo.FindFirst(t => t.Token == refreshToken && t.TokenType == "RefreshToken" && !t.IsRevoked);
            if (userToken is not null)
            {
                userToken.IsRevoked = true;
                tokenRepo.Update(userToken);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        httpContext.Response.Cookies.Delete("refreshToken");
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Đăng xuất thành công."); }
    }




    // ── Helpers ───────────────────────────────────────────────
    private async Task<AuthResponse> GenerateTokens(User user, HttpContext httpContext)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiryTime = DateTime.UtcNow.AddMinutes(_jwt.ExpiresRefreshTokenInMinutes);

        var userToken = new UserToken
        {
            UserId = user.Id.ToString(),
            Token = refreshToken,
            TokenType = "RefreshToken",
            ExpiredAt = expiryTime,
            IsRevoked = false
        };

        await _unitOfWork.IUserTokenRepository.Add(userToken);
        await _unitOfWork.SaveChangesAsync();

        SetRefreshTokenCookie(httpContext, refreshToken, expiryTime);

        return new AuthResponse
        {
            AccessToken = accessToken,
            User = ToAuthUserResponse(user)
        };
    }

    private static AuthUserResponse ToAuthUserResponse(User user)
    {
        return new AuthUserResponse
        {
            Id = user.Id.ToString(),
            FullName = user.FullName,
            Email = user.Email,
            FacilityID = user.FacilityID,
            Roles = [user.Role]
        };
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(CurrentUserContext.FacilityClaimType, user.FacilityID?.ToString() ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiresAccessTokenInMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static void SetRefreshTokenCookie(HttpContext httpContext, string token, DateTime expires)
    {
        httpContext.Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expires
        });
    }
}
