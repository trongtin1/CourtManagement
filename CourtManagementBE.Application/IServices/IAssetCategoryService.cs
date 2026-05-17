using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IAssetCategoryService
{
    Task<Result<PageList<AssetCategoryResponse>>> GetAll(QueryResource query);
    Task<Result<AssetCategoryResponse>> GetById(int id);
    Task<Result<AssetCategoryResponse>> Create(CreateAssetCategoryRequest req);
    Task<Result<AssetCategoryResponse>> Update(int id, UpdateAssetCategoryRequest req);
    Task<Result<bool>> Delete(int id);
}
