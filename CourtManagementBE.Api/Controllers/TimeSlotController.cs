using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class TimeSlotController : ControllerBase
{
    private readonly ITimeSlotService _service;
    public TimeSlotController(ITimeSlotService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryResource query) { var r = await _service.GetAll(query); return StatusCode((int)r.StatusCode, r); }

    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetByTenant(int tenantId) { var r = await _service.GetByTenant(tenantId); return StatusCode((int)r.StatusCode, r); }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) { var r = await _service.GetById(id); return StatusCode((int)r.StatusCode, r); }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTimeSlotRequest req) { var r = await _service.Create(req); return StatusCode((int)r.StatusCode, r); }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTimeSlotRequest req) { var r = await _service.Update(id, req); return StatusCode((int)r.StatusCode, r); }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) { var r = await _service.Delete(id); return StatusCode((int)r.StatusCode, r); }
}
