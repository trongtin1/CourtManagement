using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtPriceService : BaseService, ICourtPriceService
{
    private readonly ILogger<CourtPriceService> _logger;

    public CourtPriceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<CourtPriceService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtPriceResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách giá sân";
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.ICourtPriceRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtPriceRule, CourtPriceResponse>(page)); }
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourt(int courtId, DateTime targetDate)
    {
        const string loggingHeader = "Thực hiện Get By Court giá sân";
        if (!await CanAccessCourt(courtId))
            return Unauthorized<List<CourtPriceResponse>>("Bạn không có quyền truy cập sân này.");

        var response = await _unitOfWork.ICourtPriceRepository.GetCourtPriceRulesAsync(courtId, targetDate);

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(response); }
    }

    public async Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek)
    {
        const string loggingHeader = "Thực hiện Get By Court And Day giá sân";
        var weeklyResult = await GetByCourt(courtId, DateTime.UtcNow);
        if (!weeklyResult.IsSuccess || weeklyResult.Data is null)
        {
            return weeklyResult;
        }
        var filteredList = weeklyResult.Data.Where(x => x.DayOfWeek == dayOfWeek).ToList();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(filteredList); }
    }

    public async Task<Result<CourtPriceResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy giá sân theo ID";
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy giá sân.")}"); return NotFound<CourtPriceResponse>("Không tìm thấy giá sân."); }
        if (!await CanAccessCourt(entity.CourtID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập giá sân này.")}"); return Unauthorized<CourtPriceResponse>("Bạn không có quyền truy cập giá sân này."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtPriceResponse>(entity)); }
    }

    public async Task<Result<CourtPriceResponse>> Create(CourtPriceRequest request)
    {
        const string loggingHeader = "Tạo giá sân";
        if (!await CanAccessCourt(request.CourtID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền tạo giá cho sân này.")}"); return Unauthorized<CourtPriceResponse>("Bạn không có quyền tạo giá cho sân này."); }
        var validation = await ValidateRuleWindow(request.CourtID, request.DayOfWeek, request.SpecificDate, request.StartTime, request.EndTime);
        if (validation is not null) return validation;

        var entity = _mapper.Map<CourtPriceRule>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        await _unitOfWork.ICourtPriceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtPriceResponse>(entity)); }
    }

    public async Task<Result<CourtPriceResponse>> Update(int id, CourtPriceRequest request)
    {
        const string loggingHeader = "Cập nhật giá sân";
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy giá sân.")}"); return NotFound<CourtPriceResponse>("Không tìm thấy giá sân."); }
        if (!await CanAccessCourt(entity.CourtID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật giá sân này.")}"); return Unauthorized<CourtPriceResponse>("Bạn không có quyền cập nhật giá sân này."); }
        var validation = await ValidateRuleWindow(entity.CourtID, request.DayOfWeek, request.SpecificDate, request.StartTime, request.EndTime, id);
        if (validation is not null) return validation;

        var history = new CourtPriceRuleHistory
        {
            CourtPriceRuleID = entity.CourtPriceRuleID,
            CourtID = entity.CourtID,
            OldPriceRuleTypeID = entity.PriceRuleTypeID,
            NewPriceRuleTypeID = request.PriceRuleTypeID,
            DayOfWeek = entity.DayOfWeek,
            SpecificDate = entity.SpecificDate,
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
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtPriceResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa giá sân";
        var entity = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.CourtPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy giá sân.")}"); return NotFound<bool>("Không tìm thấy giá sân."); }
        if (!await CanAccessCourt(entity.CourtID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa giá sân này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa giá sân này."); }
        _unitOfWork.ICourtPriceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa giá sân thành công."); }
    }

    private async Task<Result<CourtPriceResponse>?> ValidateRuleWindow(
        int courtId,
        int? dayOfWeek,
        DateTime? specificDate,
        TimeSpan startTime,
        TimeSpan endTime,
        int? excludeId = null)
    {
        if (endTime <= startTime)
        {
            return BadRequest<CourtPriceResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        if (!dayOfWeek.HasValue && !specificDate.HasValue)
        {
            return BadRequest<CourtPriceResponse>("Vui lòng chọn ngày trong tuần hoặc ngày cụ thể.");
        }

        if (dayOfWeek.HasValue && specificDate.HasValue)
        {
            return BadRequest<CourtPriceResponse>("Không thể chọn đồng thời ngày trong tuần và ngày cụ thể.");
        }

        var overlaps = await _unitOfWork.ICourtPriceRepository.FindList(x =>
            x.CourtID == courtId
            && (!excludeId.HasValue || x.CourtPriceRuleID != excludeId.Value)
            && x.StartTime < endTime
            && x.EndTime > startTime
            && (
                (specificDate.HasValue && x.SpecificDate == specificDate.Value) ||
                (dayOfWeek.HasValue && x.DayOfWeek == dayOfWeek.Value && x.SpecificDate == null)
            ));

        return overlaps.Any()
            ? BadRequest<CourtPriceResponse>("Khung giá bị trùng với cấu hình giá hiện có.")
            : null;
    }
}
