using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourtManagementBE.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountingController : ControllerBase
{
    private readonly IAccountingService _service;

    public AccountingController(IAccountingService service)
    {
        _service = service;
    }

    [HttpGet("journal")]
    public async Task<IActionResult> GetJournal([FromQuery] JournalEntryQueryDto query)
    {
        var r = await _service.GetJournalEntriesAsync(query);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("journal/post-batch")]
    public async Task<IActionResult> PostBatch([FromBody] PostJournalEntriesRequestDto request)
    {
        var r = await _service.PostJournalEntriesAsync(request.EntryIds);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPut("journal/{id}")]
    public async Task<IActionResult> UpdateDraftJournalEntry(string id, [FromBody] JournalEntryUpdateDto request)
    {
        var r = await _service.UpdateDraftJournalEntryAsync(id, request);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var r = await _service.GetChartOfAccountsAsync();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount([FromBody] ChartOfAccountRequestDto request)
    {
        var r = await _service.CreateChartOfAccountAsync(request);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("rules")]
    public async Task<IActionResult> GetRules()
    {
        var r = await _service.GetAccountingRulesAsync();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("vouchers")]
    public async Task<IActionResult> GetVouchers()
    {
        var r = await _service.GetVouchersAsync();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("cashflow")]
    public async Task<IActionResult> GetCashflow([FromQuery] string type = "cash")
    {
        var r = await _service.GetCashflowAsync(type);
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("receivables")]
    public async Task<IActionResult> GetReceivables()
    {
        var r = await _service.GetReceivablesAsync();
        return StatusCode((int)r.StatusCode, r);
    }

    [HttpGet("payables")]
    public async Task<IActionResult> GetPayables()
    {
        var r = await _service.GetPayablesAsync();
        return StatusCode((int)r.StatusCode, r);
    }
}
