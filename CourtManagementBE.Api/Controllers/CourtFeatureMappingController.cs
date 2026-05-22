using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/court")]
[Authorize]
public class CourtFeatureMappingController : ControllerBase
{
    private readonly ICourtFeatureMappingService _service;
    public CourtFeatureMappingController(ICourtFeatureMappingService service)
    {
        _service = service;
    }

    [HttpGet("{courtId}/features")]
    public async Task<IActionResult> GetByCourt(int courtId)
    {
        var r = await _service.GetByCourt(courtId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{courtId}/features")]
    public async Task<IActionResult> Create(int courtId, [FromBody] CourtFeatureMappingRequest req)
    {
        var r = await _service.Create(courtId, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{courtId}/feature/{featureId}")]
    public async Task<IActionResult> Delete(int courtId, int featureId)
    {
        var r = await _service.Delete(courtId, featureId);
        return StatusCode((int)r.StatusCode, r);
    }
}
