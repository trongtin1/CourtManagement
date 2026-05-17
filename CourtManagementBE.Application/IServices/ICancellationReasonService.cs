using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICancellationReasonService
{
    Task<Result<PageList<CancellationReasonResponse>>> GetAll(QueryResource query);
    Task<Result<CancellationReasonResponse>> GetById(int id);
    Task<Result<CancellationReasonResponse>> Create(CreateCancellationReasonRequest req);
    Task<Result<CancellationReasonResponse>> Update(int id, UpdateCancellationReasonRequest req);
    Task<Result<bool>> Delete(int id);
}
