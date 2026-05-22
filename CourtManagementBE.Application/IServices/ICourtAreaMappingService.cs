using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface ICourtAreaMappingService
{
    Task<Result<List<CourtAreaMappingResponse>>> GetByCourt(int courtId);
    Task<Result<List<CourtAreaMappingResponse>>> GetByArea(int areaId);
    Task<Result<CourtAreaMappingResponse>> Create(CourtAreaMappingRequest request);
    Task<Result<CourtAreaMappingResponse>> Update(int id, CourtAreaMappingRequest request);
    Task<Result<bool>> Delete(int id);
}
