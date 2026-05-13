using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtService : BaseService, ICourtService
{
    public CourtService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Courts, CourtResponse>(page));
    }

    public async Task<Result<List<CourtResponse>>> GetByFacility(int facilityId)
    {
        var list = await _unitOfWork.ICourtRepository.FindList(x => x.FacilityID == facilityId);
        return Success(_mapper.Map<List<CourtResponse>>(list));
    }

    public async Task<Result<List<CourtResponse>>> GetByStatus(int statusId)
    {
        var list = await _unitOfWork.ICourtRepository.FindList(x => x.StatusID == statusId);
        return Success(_mapper.Map<List<CourtResponse>>(list));
    }

    public async Task<Result<CourtResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) return NotFound<CourtResponse>("Không tìm thấy sân.");
        return Success(_mapper.Map<CourtResponse>(entity));
    }

    public async Task<Result<CourtResponse>> Create(CreateCourtRequest request)
    {
        var entity = _mapper.Map<Courts>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtResponse>(entity));
    }

    public async Task<Result<CourtResponse>> Update(int id, UpdateCourtRequest request)
    {
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) return NotFound<CourtResponse>("Không tìm thấy sân.");
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy sân.");
        _unitOfWork.ICourtRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa sân thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy sân.");
        entity.IsActive = !entity.IsActive;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, entity.IsActive ? "Kích hoạt sân thành công." : "Vô hiệu hóa sân thành công.");
    }
}
