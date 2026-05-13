using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtPriceService : BaseService, ICourtPriceService
{
    public CourtPriceService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtPriceResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtPriceRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtPriceByTimeSlot, CourtPriceResponse>(page));
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtPriceRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtPriceResponse>>(list));
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        var list = await _unitOfWork.ICourtPriceRepository.FindList(x => x.CourtID == courtId && x.DayOfWeek == dayOfWeek);
        return Success(_mapper.Map<List<CourtPriceResponse>>(list));
    }

    public async Task<Result<CourtPriceResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<CourtPriceResponse>("Không tìm thấy giá sân.");
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<CourtPriceResponse>> Create(CreateCourtPriceRequest request)
    {
        var entity = _mapper.Map<CourtPriceByTimeSlot>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtPriceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<CourtPriceResponse>> Update(int id, UpdateCourtPriceRequest request)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<CourtPriceResponse>("Không tìm thấy giá sân.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtPriceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy giá sân.");
        _unitOfWork.ICourtPriceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa giá sân thành công.");
    }
}
