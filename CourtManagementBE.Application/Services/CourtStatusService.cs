using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtStatusService : BaseService, ICourtStatusService
{
    public CourtStatusService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtStatusResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtStatusRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtStatus, CourtStatusResponse>(page));
    }

    public async Task<Result<CourtStatusResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) return NotFound<CourtStatusResponse>("Không tìm thấy trạng thái sân.");
        return Success(_mapper.Map<CourtStatusResponse>(entity));
    }

    public async Task<Result<CourtStatusResponse>> Create(CourtStatusRequest request)
    {
        var entity = _mapper.Map<CourtStatus>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtStatusResponse>(entity));
    }

    public async Task<Result<CourtStatusResponse>> Update(int id, CourtStatusRequest request)
    {
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) return NotFound<CourtStatusResponse>("Không tìm thấy trạng thái sân.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtStatusResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy trạng thái sân.");
        _unitOfWork.ICourtStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa trạng thái sân thành công.");
    }
}
