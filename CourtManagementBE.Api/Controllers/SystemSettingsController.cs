using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/system-settings")]
[Authorize]
public class SystemSettingsController : ControllerBase
{
    private readonly ISystemSettingsService _service;

    public SystemSettingsController(ISystemSettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var r = await _service.GetSettings();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] SystemSettingsDto req)
    {
        var r = await _service.UpdateSettings(req);
        return StatusCode((int)r.StatusCode, r);
    }
}
