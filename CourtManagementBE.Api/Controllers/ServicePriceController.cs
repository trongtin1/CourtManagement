using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServicePriceController : ControllerBase
{
    private readonly IServicePriceService _service;
    public ServicePriceController(IServicePriceService service)
    {
        _service = service;
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetByService(int serviceId)
    {
        var r = await _service.GetByService(serviceId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("service/{serviceId}/current")]
    public async Task<IActionResult> GetCurrentPrice(int serviceId)
    {
        var r = await _service.GetCurrentPrice(serviceId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServicePriceRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServicePriceRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }
}
