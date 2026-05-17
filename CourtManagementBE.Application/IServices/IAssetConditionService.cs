using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IAssetConditionService
{
    Task<Result<PageList<AssetConditionResponse>>> GetAll(QueryResource query);
    Task<Result<AssetConditionResponse>> GetById(int id);
    Task<Result<AssetConditionResponse>> Create(CreateAssetConditionRequest req);
    Task<Result<AssetConditionResponse>> Update(int id, UpdateAssetConditionRequest req);
    Task<Result<bool>> Delete(int id);
}
