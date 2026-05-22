using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICancellationReasonService
{
    Task<Result<PageList<CancellationReasonResponse>>> GetAll(QueryResource query);
    Task<Result<CancellationReasonResponse>> GetById(int id);
    Task<Result<CancellationReasonResponse>> Create(CancellationReasonRequest req);
    Task<Result<CancellationReasonResponse>> Update(int id, CancellationReasonRequest req);
    Task<Result<bool>> Delete(int id);
}
