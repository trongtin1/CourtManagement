using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class AssetCategoryService : BaseService, IAssetCategoryService
{
    public AssetCategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<AssetCategoryResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IAssetCategoryRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<AssetCategories, AssetCategoryResponse>(page));
    }

    public async Task<Result<AssetCategoryResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) return NotFound<AssetCategoryResponse>("Không tìm thấy danh mục tài sản.");
        return Success(_mapper.Map<AssetCategoryResponse>(entity));
    }

    public async Task<Result<AssetCategoryResponse>> Create(CreateAssetCategoryRequest request)
    {
        var entity = _mapper.Map<AssetCategories>(request);
        await _unitOfWork.IAssetCategoryRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<AssetCategoryResponse>(entity));
    }

    public async Task<Result<AssetCategoryResponse>> Update(int id, UpdateAssetCategoryRequest request)
    {
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) return NotFound<AssetCategoryResponse>("Không tìm thấy danh mục tài sản.");
        _mapper.Map(request, entity);
        _unitOfWork.IAssetCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<AssetCategoryResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy danh mục tài sản.");
        _unitOfWork.IAssetCategoryRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa danh mục tài sản thành công.");
    }
}
