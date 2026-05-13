using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class CourtAreaMappingController : ControllerBase
{
    private readonly ICourtAreaMappingService _service;
    public CourtAreaMappingController(ICourtAreaMappingService service) => _service = service;

    [HttpGet("court/{courtId}")]
    public async Task<IActionResult> GetByCourt(int courtId) { var r = await _service.GetByCourt(courtId); return StatusCode((int)r.StatusCode, r); }

    [HttpGet("area/{areaId}")]
    public async Task<IActionResult> GetByArea(int areaId) { var r = await _service.GetByArea(areaId); return StatusCode((int)r.StatusCode, r); }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourtAreaMappingRequest req) { var r = await _service.Create(req); return StatusCode((int)r.StatusCode, r); }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCourtAreaMappingRequest req) { var r = await _service.Update(id, req); return StatusCode((int)r.StatusCode, r); }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) { var r = await _service.Delete(id); return StatusCode((int)r.StatusCode, r); }
}
