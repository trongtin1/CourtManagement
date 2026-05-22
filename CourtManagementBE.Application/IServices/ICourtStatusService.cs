using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtStatusService
{
    Task<Result<PageList<CourtStatusResponse>>> GetAll(QueryResource query);
    Task<Result<CourtStatusResponse>> GetById(int id);
    Task<Result<CourtStatusResponse>> Create(CourtStatusRequest request);
    Task<Result<CourtStatusResponse>> Update(int id, CourtStatusRequest request);
    Task<Result<bool>> Delete(int id);
}
