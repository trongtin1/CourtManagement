using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class UtilityService : BaseService, IUtilityService
{
    public UtilityService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<UtilityResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IUtilityRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Utilities, UtilityResponse>(page));
    }

    public async Task<Result<UtilityResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) return NotFound<UtilityResponse>("Không tìm thấy tiện ích.");
        return Success(_mapper.Map<UtilityResponse>(entity));
    }

    public async Task<Result<UtilityResponse>> Create(UtilityRequest request)
    {
        var entity = _mapper.Map<Utilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IUtilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<UtilityResponse>(entity));
    }

    public async Task<Result<UtilityResponse>> Update(int id, UtilityRequest request)
    {
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) return NotFound<UtilityResponse>("Không tìm thấy tiện ích.");
        _mapper.Map(request, entity);
        _unitOfWork.IUtilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<UtilityResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy tiện ích.");
        _unitOfWork.IUtilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa tiện ích thành công.");
    }
}
