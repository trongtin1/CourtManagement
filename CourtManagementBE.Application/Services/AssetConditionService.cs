using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class AssetConditionService : BaseService, IAssetConditionService
{
    private readonly ILogger<AssetConditionService> _logger;

    public AssetConditionService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<AssetConditionService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<AssetConditionResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách tình trạng tài sản";
        var page = await _unitOfWork.IAssetConditionRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<AssetConditions, AssetConditionResponse>(page)); }
    }

    public async Task<Result<AssetConditionResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy tình trạng tài sản theo ID";
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tình trạng tài sản.")}"); return NotFound<AssetConditionResponse>("Không tìm thấy tình trạng tài sản."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AssetConditionResponse>(entity)); }
    }

    public async Task<Result<AssetConditionResponse>> Create(AssetConditionRequest request)
    {
        const string loggingHeader = "Tạo tình trạng tài sản";
        var entity = _mapper.Map<AssetConditions>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IAssetConditionRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<AssetConditionResponse>(entity)); }
    }

    public async Task<Result<AssetConditionResponse>> Update(int id, AssetConditionRequest request)
    {
        const string loggingHeader = "Cập nhật tình trạng tài sản";
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tình trạng tài sản.")}"); return NotFound<AssetConditionResponse>("Không tìm thấy tình trạng tài sản."); }
        _mapper.Map(request, entity);
        _unitOfWork.IAssetConditionRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AssetConditionResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa tình trạng tài sản";
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tình trạng tài sản.")}"); return NotFound<bool>("Không tìm thấy tình trạng tài sản."); }
        _unitOfWork.IAssetConditionRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa tình trạng tài sản thành công."); }
    }
}
