using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IPaymentMethodService
{
    Task<Result<PageList<PaymentMethodResponse>>> GetAll(QueryResource query);
    Task<Result<PaymentMethodResponse>> GetById(int id);
    Task<Result<PaymentMethodResponse>> Create(PaymentMethodRequest req);
    Task<Result<PaymentMethodResponse>> Update(int id, PaymentMethodRequest req);
    Task<Result<bool>> Delete(int id);
}
