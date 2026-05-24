using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtLockedSlotService : BaseService, ICourtLockedSlotService
{
    private static readonly TimeSpan AllDayStart = new(6, 0, 0);
    private static readonly TimeSpan AllDayEnd = new(22, 0, 0);

    public CourtLockedSlotService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<CourtLockedSlotResponse>>> GetAll(QueryResource query)
    {
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.ICourtLockedSlotRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtLockedSlot, CourtLockedSlotResponse>(page));
    }

    public async Task<Result<List<CourtLockedSlotResponse>>> GetByCourt(int courtId, DateTime? targetDate)
    {
        if (!await CanAccessCourt(courtId))
            return Unauthorized<List<CourtLockedSlotResponse>>("Bạn không có quyền truy cập sân này.");

        DateTime? dateOnly = targetDate?.Date;
        int? dayOfWeek = dateOnly.HasValue ? (int)dateOnly.Value.DayOfWeek : null;

        var list = await _unitOfWork.ICourtLockedSlotRepository.FindList(x =>
            x.CourtID == courtId
            && (!dateOnly.HasValue
                || (x.IsWeekly && x.DayOfWeek == dayOfWeek)
                || (!x.IsWeekly && x.SpecificDate == dateOnly)));

        return Success(_mapper.Map<List<CourtLockedSlotResponse>>(list));
    }

    public async Task<Result<List<CourtLockedSlotResponse>>> GetAvailabilityBlocks(int courtId, DateTime targetDate)
    {
        if (!await CanAccessCourt(courtId))
            return Unauthorized<List<CourtLockedSlotResponse>>("Bạn không có quyền truy cập sân này.");

        var date = targetDate.Date;
        var day = (int)date.DayOfWeek;

        var list = await _unitOfWork.ICourtLockedSlotRepository.FindList(x =>
            x.CourtID == courtId
            && x.IsActive
            && ((x.IsWeekly && x.DayOfWeek == day) || (!x.IsWeekly && x.SpecificDate == date)));

        return Success(_mapper.Map<List<CourtLockedSlotResponse>>(list));
    }

    public async Task<Result<CourtLockedSlotResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtLockedSlotRepository.FindFirst(x => x.CourtLockedSlotID == id);
        if (entity is null) return NotFound<CourtLockedSlotResponse>("Không tìm thấy lịch khóa sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtLockedSlotResponse>("Bạn không có quyền truy cập lịch khóa sân này.");

        return Success(_mapper.Map<CourtLockedSlotResponse>(entity));
    }

    public async Task<Result<CourtLockedSlotResponse>> Create(CourtLockedSlotRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<CourtLockedSlotResponse>("Bạn không có quyền tạo lịch khóa cho sân này.");

        var validation = ValidateRequest(request);
        if (validation is not null) return validation;

        NormalizeRequest(request);

        var overlapValidation = await ValidateOverlap(request);
        if (overlapValidation is not null) return overlapValidation;

        var entity = _mapper.Map<CourtLockedSlot>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;

        await _unitOfWork.ICourtLockedSlotRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        return Created(_mapper.Map<CourtLockedSlotResponse>(entity));
    }

    public async Task<Result<CourtLockedSlotResponse>> Update(int id, CourtLockedSlotRequest request)
    {
        var entity = await _unitOfWork.ICourtLockedSlotRepository.FindFirst(x => x.CourtLockedSlotID == id);
        if (entity is null) return NotFound<CourtLockedSlotResponse>("Không tìm thấy lịch khóa sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<CourtLockedSlotResponse>("Bạn không có quyền cập nhật lịch khóa sân này.");

        request.CourtID = entity.CourtID;

        var validation = ValidateRequest(request);
        if (validation is not null) return validation;

        NormalizeRequest(request);

        var overlapValidation = await ValidateOverlap(request, id);
        if (overlapValidation is not null) return overlapValidation;

        _mapper.Map(request, entity);
        entity.UpdatedDate = DateTimeOffset.UtcNow;
        entity.UpdatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;

        _unitOfWork.ICourtLockedSlotRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return Success(_mapper.Map<CourtLockedSlotResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtLockedSlotRepository.FindFirst(x => x.CourtLockedSlotID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy lịch khóa sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa lịch khóa sân này.");

        _unitOfWork.ICourtLockedSlotRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();

        return Success(true, "Xóa lịch khóa sân thành công.");
    }

    private static void NormalizeRequest(CourtLockedSlotRequest request)
    {
        if (request.IsAllDay)
        {
            request.StartTime = AllDayStart;
            request.EndTime = AllDayEnd;
        }

        if (request.IsWeekly)
        {
            request.SpecificDate = null;
        }
        else
        {
            request.DayOfWeek = null;
            if (request.SpecificDate.HasValue)
            {
                request.SpecificDate = request.SpecificDate.Value.Date;
            }
        }
    }

    private Result<CourtLockedSlotResponse>? ValidateRequest(CourtLockedSlotRequest request)
    {
        if (request.IsWeekly)
        {
            if (!request.DayOfWeek.HasValue)
                return BadRequest<CourtLockedSlotResponse>("Cấu hình lặp tuần cần DayOfWeek.");
            if (request.SpecificDate.HasValue)
                return BadRequest<CourtLockedSlotResponse>("Cấu hình lặp tuần không được nhập SpecificDate.");
        }
        else
        {
            if (!request.SpecificDate.HasValue)
                return BadRequest<CourtLockedSlotResponse>("Cấu hình theo ngày cụ thể cần SpecificDate.");
            if (request.DayOfWeek.HasValue)
                return BadRequest<CourtLockedSlotResponse>("Cấu hình theo ngày cụ thể không được nhập DayOfWeek.");
        }

        if (!request.IsAllDay && request.EndTime <= request.StartTime)
            return BadRequest<CourtLockedSlotResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");

        if (string.IsNullOrWhiteSpace(request.LockReason))
            return BadRequest<CourtLockedSlotResponse>("Vui lòng nhập lý do khóa lịch.");

        return null;
    }

    private async Task<Result<CourtLockedSlotResponse>?> ValidateOverlap(CourtLockedSlotRequest request, int? excludeId = null)
    {
        var overlaps = await _unitOfWork.ICourtLockedSlotRepository.FindList(x =>
            x.CourtID == request.CourtID
            && (!excludeId.HasValue || x.CourtLockedSlotID != excludeId.Value)
            && x.IsWeekly == request.IsWeekly
            && (
                (request.IsWeekly && x.DayOfWeek == request.DayOfWeek)
                || (!request.IsWeekly && x.SpecificDate == request.SpecificDate)
            )
            && x.StartTime < request.EndTime
            && x.EndTime > request.StartTime);

        return overlaps.Any()
            ? Conflict<CourtLockedSlotResponse>("Khung giờ khóa bị trùng với cấu hình hiện có.")
            : null;
    }
}
