using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class CourtPriceHistoryController : ControllerBase
{
    private readonly ICourtPriceHistoryService _service;
    public CourtPriceHistoryController(ICourtPriceHistoryService service) => _service = service;

    [HttpGet("court/{courtId}")]
    public async Task<IActionResult> GetByCourt(int courtId) { var r = await _service.GetByCourt(courtId); return StatusCode((int)r.StatusCode, r); }

    [HttpGet("price-slot/{priceSlotId}")]
    public async Task<IActionResult> GetByPriceSlot(int priceSlotId) { var r = await _service.GetByPriceSlot(priceSlotId); return StatusCode((int)r.StatusCode, r); }
}
