using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingServiceController : ControllerBase
{
    private readonly IBookingServiceService _service;
    public BookingServiceController(IBookingServiceService service)
    {
        _service = service;
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId)
    {
        var r = await _service.GetByBooking(bookingId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingServiceRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingServiceRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("booking/{bookingId}/bulk")]
    public async Task<IActionResult> BulkUpdate(Guid bookingId, [FromBody] List<BookingServiceBulkUpdateItemRequest> req)
    {
        var r = await _service.BulkUpdate(bookingId, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
