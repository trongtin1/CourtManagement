using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

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

        // Load cấu hình giá riêng của sân (Custom rules)
        var courtSpecificRules = await _unitOfWork.ICourtPriceRepository.FindList(x => x.CourtID == courtId && x.IsActive);

        // Load cấu hình giá mặc định hệ thống kèm theo PriceRuleType
        var systemDefaultRules = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindList(
            predicate: x => x.IsActive,
            include: query => query.Include(x => x.PriceRuleType));

        var resolvedRules = new List<CourtPriceResponse>();

        // Quét toàn bộ 7 ngày trong tuần
        var daysToScan = Enumerable.Range(0, 7).ToList();

        foreach (var day in daysToScan)
        {
            var dayCustoms = courtSpecificRules.Where(x => x.DayOfWeek == day).ToList();

            // Tính toán ngày cụ thể cho day (0-6) trong tuần của targetDate
            int diff = day - (int)targetDate.DayOfWeek;
            DateTime specificDateForDay = targetDate.AddDays(diff).Date;

            // Ưu tiên 1: Các cấu hình dành riêng cho ngày cụ thể này
            var specificDateRules = systemDefaultRules.Where(x =>
                x.SpecificDate.HasValue && x.SpecificDate.Value.Date == specificDateForDay).ToList();

            List<CourtDefaultPriceRule> dayDefaults;
            if (specificDateRules.Any())
            {
                dayDefaults = specificDateRules;
            }
            else
            {
                // Ưu tiên 2: Lấy cấu hình tuần mặc định
                dayDefaults = systemDefaultRules.Where(x => !x.SpecificDate.HasValue && x.DayOfWeek == day).ToList();
            }

            // Luôn lấy các khung mặc định được bật IsMapping = true
            var defaultsToUse = dayDefaults.Where(d => d.PriceRuleType != null && d.PriceRuleType.IsMapping).ToList();

            // Sử dụng Court Custom Price làm nền tảng
            var baseIntervals = dayCustoms.Select(c => new TimeInterval
            {
                Start = c.StartTime,
                End = c.EndTime,
                Price = c.Price,
                PriceRuleTypeID = c.PriceRuleTypeID,
                SourceID = c.CourtPriceRuleID,
                IsDefault = false
            }).OrderBy(x => x.Start).ToList();

            // Sử dụng System Default Price làm overlay (ưu tiên cao hơn)
            var overlayIntervals = defaultsToUse.Select(d => new TimeInterval
            {
                Start = d.StartTime,
                End = d.EndTime,
                Price = d.Price,
                PriceRuleTypeID = d.PriceRuleTypeID,
                SourceID = -d.CourtDefaultPriceRuleID, // SourceID âm để phân biệt
                IsDefault = true
            }).OrderBy(x => x.Start).ToList();

            // Áp dụng thuật toán chèn và chia nhỏ khung giờ trong RAM
            var resolvedDayIntervals = baseIntervals;
            foreach (var overlay in overlayIntervals)
            {
                resolvedDayIntervals = OverlayIntervals(resolvedDayIntervals, overlay);
            }

            // Map kết quả cuối cùng sang DTO Response
            foreach (var interval in resolvedDayIntervals)
            {
                resolvedRules.Add(new CourtPriceResponse
                {
                    CourtPriceRuleID = interval.SourceID,
                    CourtID = courtId,
                    PriceRuleTypeID = interval.PriceRuleTypeID,
                    DayOfWeek = day,
                    StartTime = interval.Start,
                    EndTime = interval.End,
                    Price = interval.Price,
                    IsActive = true
                });
            }
        }

        return Success(resolvedRules);
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        // Hàm này có thể bị loại bỏ hoặc cần truyền targetDate vào.
        // Tạm thời truyền DateTime.UtcNow để không bị lỗi compile nếu còn được dùng.
        var weeklyResult = await GetByCourt(courtId, DateTime.UtcNow);
        if (!weeklyResult.IsSuccess || weeklyResult.Data is null)
        {
            return weeklyResult;
        }
        var filteredList = weeklyResult.Data.Where(x => x.DayOfWeek == dayOfWeek).ToList();
        return Success(filteredList);
    }

    private class TimeInterval
    {
        public TimeSpan Start { get; set; }
        public TimeSpan End { get; set; }
        public decimal Price { get; set; }
        public int? PriceRuleTypeID { get; set; }
        public int SourceID { get; set; }
        public bool IsDefault { get; set; }
    }

    private static List<TimeInterval> OverlayIntervals(List<TimeInterval> baseIntervals, TimeInterval custom)
    {
        var result = new List<TimeInterval>();

        foreach (var b in baseIntervals)
        {
            // Case 1: Không trùng lấn
            if (b.End <= custom.Start || b.Start >= custom.End)
            {
                result.Add(b);
            }
            // Case 2: Trùng lấn hoàn toàn (khung mặc định nằm trọn trong khung custom)
            else if (b.Start >= custom.Start && b.End <= custom.End)
            {
                // Bỏ qua khung mặc định (bị đè hoàn toàn)
            }
            else
            {
                // Case 3: Trùng lấn bên trái (khung mặc định bắt đầu trước, kết thúc trong custom)
                if (b.Start < custom.Start && b.End > custom.Start && b.End <= custom.End)
                {
                    b.End = custom.Start;
                    result.Add(b);
                }
                // Case 4: Trùng lấn bên phải (khung mặc định bắt đầu trong custom, kết thúc sau custom)
                else if (b.Start >= custom.Start && b.Start < custom.End && b.End > custom.End)
                {
                    b.Start = custom.End;
                    result.Add(b);
                }
                // Case 5: Trùng lấn ở giữa (khung custom nằm trọn trong lòng khung mặc định)
                else if (b.Start < custom.Start && b.End > custom.End)
                {
                    // Tách đôi khung mặc định thành 2 phần bên trái và bên phải
                    result.Add(new TimeInterval
                    {
                        Start = b.Start,
                        End = custom.Start,
                        Price = b.Price,
                        PriceRuleTypeID = b.PriceRuleTypeID,
                        SourceID = b.SourceID,
                        IsDefault = b.IsDefault
                    });
                    result.Add(new TimeInterval
                    {
                        Start = custom.End,
                        End = b.End,
                        Price = b.Price,
                        PriceRuleTypeID = b.PriceRuleTypeID,
                        SourceID = b.SourceID,
                        IsDefault = b.IsDefault
                    });
                }
            }
        }

        // Chèn khung custom vào
        result.Add(custom);

        // Sắp xếp lại theo giờ bắt đầu tăng dần
        return result.OrderBy(x => x.Start).ToList();
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
