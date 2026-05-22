using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtService
{
    Task<Result<PageList<CourtResponse>>> GetAll(QueryResource query);
    Task<Result<List<CourtResponse>>> GetByFacility(int facilityId);
    Task<Result<List<CourtResponse>>> GetByStatus(int statusId);
    Task<Result<CourtResponse>> GetById(int id);
    Task<Result<CourtResponse>> Create(CourtRequest request);
    Task<Result<CourtResponse>> Update(int id, CourtRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<bool>> ToggleActive(int id);
}
