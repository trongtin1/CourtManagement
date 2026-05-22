using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IFacilityService
{
    Task<Result<PageList<FacilityResponse>>> GetAll(QueryResource query);
    Task<Result<FacilityResponse>> GetById(int id);
    Task<Result<FacilityResponse>> Create(FacilityRequest request);
    Task<Result<FacilityResponse>> Update(int id, FacilityRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<bool>> ToggleActive(int id);
}
