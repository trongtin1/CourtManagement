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
    public CourtPriceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<CourtPriceResponse>>> GetAll(QueryResource query)
    {
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.ICourtPriceRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtPriceByTimeSlot, CourtPriceResponse>(page));
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourt(int courtId)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<CourtPriceResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.ICourtPriceRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtPriceResponse>>(list));
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<CourtPriceResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.ICourtPriceRepository.FindList(x => x.CourtID == courtId && x.DayOfWeek == dayOfWeek);
        return Success(_mapper.Map<List<CourtPriceResponse>>(list));
    }

    public async Task<Result<CourtPriceResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<CourtPriceResponse>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền truy cập giá sân này.");
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<CourtPriceResponse>> Create(CreateCourtPriceRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền tạo giá cho sân này.");
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
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền cập nhật giá sân này.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtPriceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa giá sân này.");
        _unitOfWork.ICourtPriceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa giá sân thành công.");
    }
}
