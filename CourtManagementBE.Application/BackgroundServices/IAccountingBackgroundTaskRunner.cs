namespace CourtManagementBE.Application.BackgroundServices;

public interface IAccountingBackgroundTaskRunner
{
    void QueueProcessPaymentAccounting(string paymentId);
    void QueueRecordReceivable(string bookingId);
}
