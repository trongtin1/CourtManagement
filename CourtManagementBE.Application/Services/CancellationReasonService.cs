using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CancellationReasonService : BaseService, ICancellationReasonService
{
    public CancellationReasonService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CancellationReasonResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICancellationReasonRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CancellationReasons, CancellationReasonResponse>(page));
    }

    public async Task<Result<CancellationReasonResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) return NotFound<CancellationReasonResponse>("Không tìm thấy lý do hủy.");
        return Success(_mapper.Map<CancellationReasonResponse>(entity));
    }

    public async Task<Result<CancellationReasonResponse>> Create(CreateCancellationReasonRequest request)
    {
        var entity = _mapper.Map<CancellationReasons>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICancellationReasonRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CancellationReasonResponse>(entity));
    }

    public async Task<Result<CancellationReasonResponse>> Update(int id, UpdateCancellationReasonRequest request)
    {
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) return NotFound<CancellationReasonResponse>("Không tìm thấy lý do hủy.");
        _mapper.Map(request, entity);
        _unitOfWork.ICancellationReasonRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CancellationReasonResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy lý do hủy.");
        _unitOfWork.ICancellationReasonRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa lý do hủy thành công.");
    }
}
