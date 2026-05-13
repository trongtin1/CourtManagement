using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class BookingSlotController : ControllerBase
{
    private readonly IBookingSlotService _service;
    public BookingSlotController(IBookingSlotService service) => _service = service;

    [HttpGet("booking/{bookingId}")]
    public async Task<IActionResult> GetByBooking(Guid bookingId) { var r = await _service.GetByBooking(bookingId); return StatusCode((int)r.StatusCode, r); }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingSlotRequest req) { var r = await _service.Create(req); return StatusCode((int)r.StatusCode, r); }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) { var r = await _service.Delete(id); return StatusCode((int)r.StatusCode, r); }
}
