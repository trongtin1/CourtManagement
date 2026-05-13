using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IPaymentService
{
    Task<Result<PageList<PaymentResponse>>> GetAll(QueryResource query);
    Task<Result<List<PaymentResponse>>> GetByBooking(Guid bookingId);
    Task<Result<PaymentResponse>> GetById(int id);
    Task<Result<PaymentResponse>> Create(CreatePaymentRequest request);
    Task<Result<PaymentResponse>> Update(int id, UpdatePaymentRequest request);
}
