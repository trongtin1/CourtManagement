using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class AssetCategoryService : BaseService, IAssetCategoryService
{
    private readonly ILogger<AssetCategoryService> _logger;

    public AssetCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<AssetCategoryService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<AssetCategoryResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách danh mục tài sản";
        var page = await _unitOfWork.IAssetCategoryRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<AssetCategories, AssetCategoryResponse>(page)); }
    }

    public async Task<Result<AssetCategoryResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy danh mục tài sản theo ID";
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy danh mục tài sản.")}"); return NotFound<AssetCategoryResponse>("Không tìm thấy danh mục tài sản."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AssetCategoryResponse>(entity)); }
    }

    public async Task<Result<AssetCategoryResponse>> Create(AssetCategoryRequest request)
    {
        const string loggingHeader = "Tạo danh mục tài sản";
        var entity = _mapper.Map<AssetCategories>(request);
        await _unitOfWork.IAssetCategoryRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<AssetCategoryResponse>(entity)); }
    }

    public async Task<Result<AssetCategoryResponse>> Update(int id, AssetCategoryRequest request)
    {
        const string loggingHeader = "Cập nhật danh mục tài sản";
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy danh mục tài sản.")}"); return NotFound<AssetCategoryResponse>("Không tìm thấy danh mục tài sản."); }
        _mapper.Map(request, entity);
        _unitOfWork.IAssetCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AssetCategoryResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa danh mục tài sản";
        var entity = await _unitOfWork.IAssetCategoryRepository.FindFirst(x => x.AssetCategoryID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy danh mục tài sản.")}"); return NotFound<bool>("Không tìm thấy danh mục tài sản."); }
        _unitOfWork.IAssetCategoryRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa danh mục tài sản thành công."); }
    }
}
