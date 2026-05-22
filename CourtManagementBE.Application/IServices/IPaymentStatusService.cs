using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IPaymentStatusService
{
    Task<Result<PageList<PaymentStatusResponse>>> GetAll(QueryResource query);
    Task<Result<PaymentStatusResponse>> GetById(int id);
    Task<Result<PaymentStatusResponse>> Create(PaymentStatusRequest req);
    Task<Result<PaymentStatusResponse>> Update(int id, PaymentStatusRequest req);
    Task<Result<bool>> Delete(int id);
}
