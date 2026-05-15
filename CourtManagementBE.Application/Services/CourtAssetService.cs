using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtAssetService : BaseService, ICourtAssetService
{
    public CourtAssetService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtAssetResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtAssetRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtAssets, CourtAssetResponse>(page));
    }

    public async Task<Result<List<CourtAssetResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtAssetRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtAssetResponse>>(list));
    }

    public async Task<Result<CourtAssetResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id);
        if (entity is null) return NotFound<CourtAssetResponse>("Khong tim thay tai san san.");
        return Success(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<CourtAssetResponse>> Create(CreateCourtAssetRequest request)
    {
        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null) return NotFound<CourtAssetResponse>("Khong tim thay san.");

        var existing = await _unitOfWork.ICourtAssetRepository.FindFirst(
            x => x.CourtID == request.CourtID && x.AssetCode == request.AssetCode);
        if (existing is not null) return BadRequest<CourtAssetResponse>("Ma tai san da ton tai trong san nay.");

        var entity = _mapper.Map<CourtAssets>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtAssetRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<CourtAssetResponse>> Update(int id, UpdateCourtAssetRequest request)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id, disableTracking: false);
        if (entity is null) return NotFound<CourtAssetResponse>("Khong tim thay tai san san.");

        var duplicate = await _unitOfWork.ICourtAssetRepository.FindFirst(
            x => x.CourtID == entity.CourtID && x.AssetCode == request.AssetCode && x.CourtAssetID != id);
        if (duplicate is not null) return BadRequest<CourtAssetResponse>("Ma tai san da ton tai trong san nay.");

        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtAssetRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id);
        if (entity is null) return NotFound<bool>("Khong tim thay tai san san.");
        _unitOfWork.ICourtAssetRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xoa tai san san thanh cong.");
    }
}
