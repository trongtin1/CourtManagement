using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;

    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.Register(request, HttpContext);
        return StatusCode((int)result.StatusCode, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.Login(request, HttpContext);
        return StatusCode((int)result.StatusCode, result);
    }

    // [HttpPost("refresh-token")]
    // public async Task<IActionResult> RefreshToken()
    // {
    //     var result = await _authService.RefreshToken(HttpContext);
    //     return StatusCode((int)result.StatusCode, result);
    // }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var result = await _authService.GetCurrentUser(HttpContext);
        return StatusCode((int)result.StatusCode, result);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var result = await _authService.Logout(HttpContext);
        return StatusCode((int)result.StatusCode, result);
    }
}
