using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class AssetConditionService : BaseService, IAssetConditionService
{
    public AssetConditionService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<AssetConditionResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IAssetConditionRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<AssetConditions, AssetConditionResponse>(page));
    }

    public async Task<Result<AssetConditionResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) return NotFound<AssetConditionResponse>("Không tìm thấy tình trạng tài sản.");
        return Success(_mapper.Map<AssetConditionResponse>(entity));
    }

    public async Task<Result<AssetConditionResponse>> Create(CreateAssetConditionRequest request)
    {
        var entity = _mapper.Map<AssetConditions>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IAssetConditionRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<AssetConditionResponse>(entity));
    }

    public async Task<Result<AssetConditionResponse>> Update(int id, UpdateAssetConditionRequest request)
    {
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) return NotFound<AssetConditionResponse>("Không tìm thấy tình trạng tài sản.");
        _mapper.Map(request, entity);
        _unitOfWork.IAssetConditionRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<AssetConditionResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IAssetConditionRepository.FindFirst(x => x.AssetConditionID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy tình trạng tài sản.");
        _unitOfWork.IAssetConditionRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa tình trạng tài sản thành công.");
    }
}
