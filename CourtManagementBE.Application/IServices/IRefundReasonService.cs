using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IRefundReasonService
{
    Task<Result<PageList<RefundReasonResponse>>> GetAll(QueryResource query);
    Task<Result<RefundReasonResponse>> GetById(int id);
    Task<Result<RefundReasonResponse>> Create(RefundReasonRequest req);
    Task<Result<RefundReasonResponse>> Update(int id, RefundReasonRequest req);
    Task<Result<bool>> Delete(int id);
}
