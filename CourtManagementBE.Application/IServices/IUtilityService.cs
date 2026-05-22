using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IUtilityService
{
    Task<Result<PageList<UtilityResponse>>> GetAll(QueryResource query);
    Task<Result<UtilityResponse>> GetById(int id);
    Task<Result<UtilityResponse>> Create(UtilityRequest request);
    Task<Result<UtilityResponse>> Update(int id, UtilityRequest request);
    Task<Result<bool>> Delete(int id);
}
