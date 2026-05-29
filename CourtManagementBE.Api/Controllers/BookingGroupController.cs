using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingGroupController : ControllerBase
{
    private readonly IBookingGroupService _service;

    public BookingGroupController(IBookingGroupService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] QueryResource query)
    {
        var r = await _service.GetAll(query);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var r = await _service.GetByCustomer(customerId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _service.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingGroupRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] BookingGroupRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] string reason)
    {
        var r = await _service.Cancel(id, reason);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
