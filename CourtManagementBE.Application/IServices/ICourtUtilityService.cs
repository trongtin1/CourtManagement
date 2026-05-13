using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface ICourtUtilityService
{
    Task<Result<List<CourtUtilityResponse>>> GetByCourt(int courtId);
    Task<Result<CourtUtilityResponse>> Create(CreateCourtUtilityRequest request);
    Task<Result<bool>> Delete(int id);
}
