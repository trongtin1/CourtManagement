using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface ICourtFeatureMappingService
{
    Task<Result<List<CourtFeatureMappingResponse>>> GetByCourt(int courtId);
    Task<Result<CourtFeatureMappingResponse>> Create(CreateCourtFeatureMappingRequest request);
    Task<Result<bool>> Delete(int id);
}
