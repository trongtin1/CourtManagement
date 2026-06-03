using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;
    public PaymentController(IPaymentService service)
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
}
