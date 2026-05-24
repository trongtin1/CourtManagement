using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourtLockedSlotController : ControllerBase
{
    private readonly ICourtLockedSlotService _service;

    public CourtLockedSlotController(ICourtLockedSlotService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryResource query)
    {
        var r = await _service.GetAll(query);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("court/{courtId}")]
    public async Task<IActionResult> GetByCourt(int courtId, [FromQuery] DateTime? targetDate)
    {
        var r = await _service.GetByCourt(courtId, targetDate);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("court/{courtId}/availability")]
    public async Task<IActionResult> GetAvailabilityBlocks(int courtId, [FromQuery] DateTime targetDate)
    {
        var r = await _service.GetAvailabilityBlocks(courtId, targetDate);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CourtLockedSlotRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CourtLockedSlotRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
