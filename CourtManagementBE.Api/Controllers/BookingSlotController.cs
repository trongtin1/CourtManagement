using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingSlotController : ControllerBase
{
    private readonly IBookingSlotService _service;
    public BookingSlotController(IBookingSlotService service)
    {
        _service = service;
    }

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId)
    {
        var r = await _service.GetByBooking(bookingId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("court/{courtId}/date/{date}")]
    public async Task<IActionResult> GetByCourtAndDate(int courtId, DateTime date)
    {
        var r = await _service.GetByCourtAndDate(courtId, date);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetByDate(DateTime date)
    {
        var r = await _service.GetByDate(date);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingSlotRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
