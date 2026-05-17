using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class AreaService : BaseService, IAreaService
{
    public AreaService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<AreaResponse>>> GetAll(QueryResource query)
    {
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.IAreaRepository.FindAll(
            x => workingFacilityId == null || x.FacilityID == workingFacilityId,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Areas, AreaResponse>(page));
    }

    public async Task<Result<List<AreaResponse>>> GetByFacility(int facilityId)
    {
        if (!CanAccessFacility(facilityId)) return Unauthorized<List<AreaResponse>>("Bạn không có quyền truy cập cơ sở này.");
        var list = await _unitOfWork.IAreaRepository.FindList(x => x.FacilityID == facilityId);
        return Success(_mapper.Map<List<AreaResponse>>(list));
    }

    public async Task<Result<AreaResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) return NotFound<AreaResponse>("Không tìm thấy khu vực.");
        if (!CanAccessFacility(entity.FacilityID)) return Unauthorized<AreaResponse>("Bạn không có quyền truy cập khu vực này.");
        return Success(_mapper.Map<AreaResponse>(entity));
    }

    public async Task<Result<AreaResponse>> Create(CreateAreaRequest request)
    {
        var facilityId = WorkingFacilityId ?? request.FacilityID;
        if (!CanAccessFacility(facilityId)) return Unauthorized<AreaResponse>("Bạn không có quyền tạo khu vực cho cơ sở này.");

        request.FacilityID = facilityId;
        var entity = _mapper.Map<Areas>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IAreaRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<AreaResponse>(entity));
    }

    public async Task<Result<AreaResponse>> Update(int id, UpdateAreaRequest request)
    {
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) return NotFound<AreaResponse>("Không tìm thấy khu vực.");
        if (!CanAccessFacility(entity.FacilityID)) return Unauthorized<AreaResponse>("Bạn không có quyền cập nhật khu vực này.");
        _mapper.Map(request, entity);
        _unitOfWork.IAreaRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<AreaResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy khu vực.");
        if (!CanAccessFacility(entity.FacilityID)) return Unauthorized<bool>("Bạn không có quyền xóa khu vực này.");
        _unitOfWork.IAreaRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa khu vực thành công.");
    }
}
