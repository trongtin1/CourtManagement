using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourtPriceController : ControllerBase
{
    private readonly ICourtPriceService _service;
    public CourtPriceController(ICourtPriceService service)
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
    public async Task<IActionResult> GetByCourt(int courtId, [FromQuery] DateTime targetDate)
    {
        var r = await _service.GetByCourt(courtId, targetDate);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("court/{courtId}/day/{dayOfWeek}")]
    public async Task<IActionResult> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        var r = await _service.GetByCourtAndDay(courtId, dayOfWeek);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CourtPriceRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CourtPriceRequest req)
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
