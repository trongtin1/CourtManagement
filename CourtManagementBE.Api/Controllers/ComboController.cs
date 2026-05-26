using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComboController : ControllerBase
{
    private readonly IComboService _comboService;

    public ComboController(IComboService comboService)
    {
        _comboService = comboService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryResource query)
    {
        var r = await _comboService.GetAll(query);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _comboService.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ComboRequest req)
    {
        var r = await _comboService.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ComboRequest req)
    {
        var r = await _comboService.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var r = await _comboService.ToggleActive(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _comboService.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
