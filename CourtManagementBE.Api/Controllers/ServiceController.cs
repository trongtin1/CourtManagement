using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServiceController : ControllerBase
{
    private readonly IServiceService _service;
    public ServiceController(IServiceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryResource query)
    {
        var r = await _service.GetAll(query);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ServiceRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ServiceRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var r = await _service.ToggleActive(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/deduct-stock")]
    public async Task<IActionResult> DeductStock(int id, [FromBody] StockAdjustmentRequest req)
    {
        var r = await _service.DeductStock(id, req.Quantity);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/handout-rental")]
    public async Task<IActionResult> HandoutRental(int id, [FromBody] StockAdjustmentRequest req)
    {
        var r = await _service.HandoutRental(id, req.Quantity);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/return-rental")]
    public async Task<IActionResult> ReturnRental(int id, [FromBody] StockAdjustmentRequest req)
    {
        var r = await _service.ReturnRental(id, req.Quantity);
        return StatusCode((int)r.StatusCode, r);
    }
}
