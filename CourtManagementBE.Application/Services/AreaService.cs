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
    public AreaService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<AreaResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IAreaRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Areas, AreaResponse>(page));
    }

    public async Task<Result<List<AreaResponse>>> GetByFacility(int facilityId)
    {
        var list = await _unitOfWork.IAreaRepository.FindList(x => x.FacilityID == facilityId);
        return Success(_mapper.Map<List<AreaResponse>>(list));
    }

    public async Task<Result<AreaResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) return NotFound<AreaResponse>("Không tìm thấy khu vực.");
        return Success(_mapper.Map<AreaResponse>(entity));
    }

    public async Task<Result<AreaResponse>> Create(CreateAreaRequest request)
    {
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
        _mapper.Map(request, entity);
        _unitOfWork.IAreaRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<AreaResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy khu vực.");
        _unitOfWork.IAreaRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa khu vực thành công.");
    }
}
