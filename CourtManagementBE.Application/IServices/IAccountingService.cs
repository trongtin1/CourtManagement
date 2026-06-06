using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IAccountingService
{
    Task<Result<List<JournalEntryResponseDto>>> GetJournalEntriesAsync(JournalEntryQueryDto query);
    Task<Result<PostJournalEntriesResponseDto>> PostJournalEntriesAsync(List<string> entryIds);
    Task<Result<JournalEntryResponseDto>> UpdateDraftJournalEntryAsync(string id, JournalEntryUpdateDto dto);
    Task<Result<List<ChartOfAccountResponseDto>>> GetChartOfAccountsAsync();
    Task<Result<ChartOfAccountResponseDto>> CreateChartOfAccountAsync(ChartOfAccountRequestDto request);
    Task<Result<List<AccountingRuleResponseDto>>> GetAccountingRulesAsync();
    Task<Result<List<VoucherResponseDto>>> GetVouchersAsync();
    Task<Result<CashflowResponseDto>> GetCashflowAsync(string type);
    Task<Result<List<ReceivableResponseDto>>> GetReceivablesAsync();
    Task<Result<List<PayableResponseDto>>> GetPayablesAsync();

    /// <summary>
    /// Tự sinh bút toán nháp cho một giao dịch thanh toán trong hệ thống kế toán.
    /// </summary>
    Task ProcessPaymentAccountingAsync(string paymentId);

    /// <summary>
    /// Tự sinh bút toán nháp ghi nhận công nợ phải thu cho đơn đặt sân trả sau.
    /// </summary>
    Task RecordReceivableAsync(string bookingId);
}
