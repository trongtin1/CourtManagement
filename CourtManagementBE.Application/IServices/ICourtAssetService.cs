using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtAssetService
{
    Task<Result<PageList<CourtAssetResponse>>> GetAll(QueryResource query);
    Task<Result<List<CourtAssetResponse>>> GetByCourt(int courtId);
    Task<Result<CourtAssetResponse>> GetById(int id);
    Task<Result<CourtAssetResponse>> Create(CourtAssetRequest request);
    Task<Result<CourtAssetResponse>> Update(int id, CourtAssetRequest request);
    Task<Result<bool>> Delete(int id);
}
