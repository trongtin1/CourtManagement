using CourtManagementBE.Application.IServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CourtManagementBE.Application.BackgroundServices;

public class AccountingBackgroundTaskRunner : IAccountingBackgroundTaskRunner
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AccountingBackgroundTaskRunner> _logger;

    public AccountingBackgroundTaskRunner(
        IServiceScopeFactory scopeFactory,
        ILogger<AccountingBackgroundTaskRunner> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public void QueueProcessPaymentAccounting(string paymentId)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IAccountingService>();
                await service.ProcessPaymentAccountingAsync(paymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi sinh bút toán nháp thanh toán dưới background. PaymentID={PaymentId}", paymentId);
            }
        });
    }

    public void QueueRecordReceivable(string bookingId)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IAccountingService>();
                await service.RecordReceivableAsync(bookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi sinh bút toán nháp công nợ dưới background. BookingID={BookingId}", bookingId);
            }
        });
    }
}
