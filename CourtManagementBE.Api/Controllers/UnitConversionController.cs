using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitConversionController : ControllerBase
{
    private readonly IUnitConversionService _service;

    public UnitConversionController(IUnitConversionService service)
    {
        _service = service;
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetByService(int serviceId)
    {
        var r = await _service.GetByService(serviceId);
        return StatusCode((int)r.StatusCode, r);
    }


    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UnitConversionRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UnitConversionRequest req)
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
