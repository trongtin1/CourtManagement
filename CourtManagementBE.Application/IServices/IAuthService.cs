using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IAuthService
{
    Task<Result<AuthResponse>> Register(RegisterRequest request, HttpContext httpContext);
    Task<Result<AuthResponse>> Login(LoginRequest request, HttpContext httpContext);
    Task<Result<AuthUserResponse>> GetCurrentUser(HttpContext httpContext);
    Task<Result<bool>> Logout(HttpContext httpContext);
}
