using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class FacilityService : BaseService, IFacilityService
{
    public FacilityService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<FacilityResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IFacilityRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Facilities, FacilityResponse>(page));
    }

    public async Task<Result<FacilityResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) return NotFound<FacilityResponse>("Không tìm thấy cơ sở.");
        return Success(_mapper.Map<FacilityResponse>(entity));
    }

    public async Task<Result<FacilityResponse>> Create(CreateFacilityRequest request)
    {
        var entity = _mapper.Map<Facilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IFacilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<FacilityResponse>(entity));
    }

    public async Task<Result<FacilityResponse>> Update(int id, UpdateFacilityRequest request)
    {
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) return NotFound<FacilityResponse>("Không tìm thấy cơ sở.");
        _mapper.Map(request, entity);
        _unitOfWork.IFacilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<FacilityResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy cơ sở.");
        _unitOfWork.IFacilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa cơ sở thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy cơ sở.");
        entity.IsActive = !entity.IsActive;
        _unitOfWork.IFacilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, entity.IsActive ? "Kích hoạt thành công." : "Vô hiệu hóa thành công.");
    }
}
