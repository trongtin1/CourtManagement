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
        return Success(MapPageList<CourtPriceRule, CourtPriceResponse>(page));
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourt(int courtId, DateTime targetDate)
    {
        if (!await CanAccessCourt(courtId))
            return Unauthorized<List<CourtPriceResponse>>("Bạn không có quyền truy cập sân này.");

        var resolved = await _unitOfWork.ICourtPriceRepository.GetCourtPriceRulesAsync(courtId, targetDate);
        var response = _mapper.Map<List<CourtPriceResponse>>(resolved);

        return Success(response);
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        var weeklyResult = await GetByCourt(courtId, DateTime.UtcNow);
        if (!weeklyResult.IsSuccess || weeklyResult.Data is null)
        {
            return weeklyResult;
        }
        var filteredList = weeklyResult.Data.Where(x => x.DayOfWeek == dayOfWeek).ToList();
        return Success(filteredList);
    }

    public async Task<Result<CourtPriceResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) return NotFound<CourtPriceResponse>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền truy cập giá sân này.");
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<CourtPriceResponse>> Create(CourtPriceRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền tạo giá cho sân này.");
        var validation = await ValidateRuleWindow(request.CourtID, request.DayOfWeek, request.StartTime, request.EndTime);
        if (validation is not null) return validation;

        var entity = _mapper.Map<CourtPriceRule>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        await _unitOfWork.ICourtPriceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<CourtPriceResponse>> Update(int id, CourtPriceRequest request)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) return NotFound<CourtPriceResponse>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtPriceResponse>("Bạn không có quyền cập nhật giá sân này.");
        var validation = await ValidateRuleWindow(entity.CourtID, request.DayOfWeek, request.StartTime, request.EndTime, id);
        if (validation is not null) return validation;

        var history = new CourtPriceRuleHistory
        {
            CourtPriceRuleID = entity.CourtPriceRuleID,
            CourtID = entity.CourtID,
            OldPriceRuleTypeID = entity.PriceRuleTypeID,
            NewPriceRuleTypeID = request.PriceRuleTypeID,
            DayOfWeek = entity.DayOfWeek,
            OldStartTime = entity.StartTime,
            OldEndTime = entity.EndTime,
            OldPrice = entity.Price,
            NewStartTime = request.StartTime,
            NewEndTime = request.EndTime,
            NewPrice = request.Price,
            ChangedBy = _currentUser?.UserId?.ToString() ?? string.Empty,
            Reason = "Price rule updated",
        };

        _mapper.Map(request, entity);
        entity.UpdatedDate = DateTimeOffset.UtcNow;
        entity.UpdatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        _unitOfWork.ICourtPriceRepository.Update(entity);
        await _unitOfWork.ICourtPriceRuleHistoryRepository.Add(history);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtPriceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa giá sân này.");
        _unitOfWork.ICourtPriceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa giá sân thành công.");
    }

    private async Task<Result<CourtPriceResponse>?> ValidateRuleWindow(
        int courtId,
        int dayOfWeek,
        TimeSpan startTime,
        TimeSpan endTime,
        int? excludeId = null)
    {
        if (endTime <= startTime)
        {
            return BadRequest<CourtPriceResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var overlaps = await _unitOfWork.ICourtPriceRepository.FindList(x =>
            x.CourtID == courtId
            && x.DayOfWeek == dayOfWeek
            && (!excludeId.HasValue || x.CourtPriceRuleID != excludeId.Value)
            && x.StartTime < endTime
            && x.EndTime > startTime);

        return overlaps.Any()
            ? BadRequest<CourtPriceResponse>("Khung giá bị trùng với cấu hình giá hiện có.")
            : null;
    }
}
