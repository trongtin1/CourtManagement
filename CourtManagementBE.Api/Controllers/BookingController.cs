using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Application.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _service;
    public BookingController(IBookingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] BookingResource query)
    {
        var r = await _service.GetAll(query);
        return StatusCode((int)r.StatusCode, r);
    }


    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetByDate(DateTime date)
    {
        var r = await _service.GetByDate(date);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var r = await _service.GetById(id);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingRequest req)
    {
        var r = await _service.Create(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("full")]
    public async Task<IActionResult> CreateFull([FromBody] CreateFullBookingRequest req)
    {
        var r = await _service.CreateFull(req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BookingRequest req)
    {
        var r = await _service.Update(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] BookingRequest req)
    {
        var r = await _service.Cancel(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var r = await _service.UpdateStatus(id, status);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> Pay(Guid id, [FromBody] BookingPaymentRequest req)
    {
        var r = await _service.Pay(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/refund")]
    public async Task<IActionResult> Refund(Guid id, [FromBody] BookingRefundRequest req)
    {
        var r = await _service.Refund(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("{id}/reschedule")]
    public async Task<IActionResult> Reschedule(Guid id, [FromBody] RescheduleBookingRequest req)
    {
        var r = await _service.Reschedule(id, req);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("statuses")]
    public async Task<IActionResult> GetStatuses()
    {
        var r = await _service.GetStatuses();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] Guid? bookingId)
    {
        var r = await _service.GetHistory(bookingId);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var r = await _service.Delete(id);
        return StatusCode((int)r.StatusCode, r);
    }
}
