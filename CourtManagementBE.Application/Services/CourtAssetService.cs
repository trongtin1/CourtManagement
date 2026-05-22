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
    public CourtAssetService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<CourtAssetResponse>>> GetAll(QueryResource query)
    {
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.ICourtAssetRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtAssets, CourtAssetResponse>(page));
    }

    public async Task<Result<List<CourtAssetResponse>>> GetByCourt(int courtId)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<CourtAssetResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.ICourtAssetRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtAssetResponse>>(list));
    }

    public async Task<Result<CourtAssetResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id);
        if (entity is null) return NotFound<CourtAssetResponse>("Không tìm thấy tài sản sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtAssetResponse>("Bạn không có quyền truy cập tài sản này.");
        return Success(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<CourtAssetResponse>> Create(CourtAssetRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<CourtAssetResponse>("Bạn không có quyền tạo tài sản cho sân này.");

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null) return NotFound<CourtAssetResponse>("Không tìm thấy sân.");

        var existing = await _unitOfWork.ICourtAssetRepository.FindFirst(
            x => x.CourtID == request.CourtID && x.AssetCode == request.AssetCode);
        if (existing is not null) return BadRequest<CourtAssetResponse>("Mã tài sản đã tồn tại trong sân này.");

        var entity = _mapper.Map<CourtAssets>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtAssetRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<CourtAssetResponse>> Update(int id, CourtAssetRequest request)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id, disableTracking: false);
        if (entity is null) return NotFound<CourtAssetResponse>("Không tìm thấy tài sản sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtAssetResponse>("Bạn không có quyền cập nhật tài sản này.");

        var duplicate = await _unitOfWork.ICourtAssetRepository.FindFirst(
            x => x.CourtID == entity.CourtID && x.AssetCode == request.AssetCode && x.CourtAssetID != id);
        if (duplicate is not null) return BadRequest<CourtAssetResponse>("Mã tài sản đã tồn tại trong sân này.");

        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtAssetRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtAssetResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtAssetRepository.FindFirst(x => x.CourtAssetID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy tài sản sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa tài sản này.");
        _unitOfWork.ICourtAssetRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa tài sản sân thành công.");
    }
}
