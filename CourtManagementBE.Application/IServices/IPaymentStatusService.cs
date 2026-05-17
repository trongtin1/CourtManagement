using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IPaymentStatusService
{
    Task<Result<PageList<PaymentStatusResponse>>> GetAll(QueryResource query);
    Task<Result<PaymentStatusResponse>> GetById(int id);
    Task<Result<PaymentStatusResponse>> Create(CreatePaymentStatusRequest req);
    Task<Result<PaymentStatusResponse>> Update(int id, UpdatePaymentStatusRequest req);
    Task<Result<bool>> Delete(int id);
}
