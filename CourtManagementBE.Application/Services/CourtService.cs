using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtService : BaseService, ICourtService
{
    private readonly ILogger<CourtService> _logger;

    public CourtService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<CourtService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách sân";
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.ICourtRepository.FindAll(
            x => workingFacilityId == null || x.FacilityID == workingFacilityId,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<Courts, CourtResponse>(page)); }
    }

    public async Task<Result<List<CourtResponse>>> GetByFacility(int facilityId)
    {
        const string loggingHeader = "Lấy sân theo cơ sở";
        if (!CanAccessFacility(facilityId)) return Unauthorized<List<CourtResponse>>("Bạn không có quyền truy cập cơ sở này.");
        var list = await _unitOfWork.ICourtRepository.FindList(x => x.FacilityID == facilityId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtResponse>>(list)); }
    }

    public async Task<Result<List<CourtResponse>>> GetByStatus(int statusId)
    {
        const string loggingHeader = "Thực hiện Get By Status sân";
        var workingFacilityId = WorkingFacilityId;
        var list = await _unitOfWork.ICourtRepository.FindList(
            x => x.StatusID == statusId && (workingFacilityId == null || x.FacilityID == workingFacilityId));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtResponse>>(list)); }
    }

    public async Task<Result<CourtResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy sân theo ID";
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy sân.")}"); return NotFound<CourtResponse>("Không tìm thấy sân."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập sân này.")}"); return Unauthorized<CourtResponse>("Bạn không có quyền truy cập sân này."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtResponse>(entity)); }
    }

    public async Task<Result<CourtResponse>> Create(CourtRequest request)
    {
        const string loggingHeader = "Tạo sân";
        var facilityId = WorkingFacilityId ?? request.FacilityID;
        if (!CanAccessFacility(facilityId)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền tạo sân cho cơ sở này.")}"); return Unauthorized<CourtResponse>("Bạn không có quyền tạo sân cho cơ sở này."); }

        request.FacilityID = facilityId;
        var entity = _mapper.Map<Courts>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtResponse>(entity)); }
    }

    public async Task<Result<CourtResponse>> Update(int id, CourtRequest request)
    {
        const string loggingHeader = "Cập nhật sân";
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy sân.")}"); return NotFound<CourtResponse>("Không tìm thấy sân."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật sân này.")}"); return Unauthorized<CourtResponse>("Bạn không có quyền cập nhật sân này."); }
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa sân";
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy sân.")}"); return NotFound<bool>("Không tìm thấy sân."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa sân này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa sân này."); }
        _unitOfWork.ICourtRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa sân thành công."); }
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        const string loggingHeader = "Chuyển trạng thái kích hoạt sân";
        var entity = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy sân.")}"); return NotFound<bool>("Không tìm thấy sân."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật sân này.")}"); return Unauthorized<bool>("Bạn không có quyền cập nhật sân này."); }
        entity.IsActive = !entity.IsActive;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.ICourtRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, entity.IsActive ? "Kích hoạt sân thành công." : "Vô hiệu hóa sân thành công."); }
    }

    public async Task<Result<List<CourtSlotAvailabilityResponse>>> GetSlotsAvailability(int courtId, DateTime date)
    {
        const string loggingHeader = "Thực hiện Get Slots Availability sân";
        if (!await CanAccessCourt(courtId))
            return Unauthorized<List<CourtSlotAvailabilityResponse>>("Bạn không có quyền truy cập sân này.");

        var slots = await _unitOfWork.ICourtRepository.GetSlotAvailabilityAsync(courtId, date);

        // Sinh SlotName nếu SP chưa có
        foreach (var slot in slots)
        {
            if (string.IsNullOrEmpty(slot.SlotName))
            {
                var start = slot.StartTime.Length >= 5 ? slot.StartTime[..5] : slot.StartTime;
                var end = slot.EndTime.Length >= 5 ? slot.EndTime[..5] : slot.EndTime;
                slot.SlotName = $"{start} - {end}";
            }
        }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(slots); }
    }

    public async Task<Result<List<CourtTimelineAvailabilityResponse>>> GetTimelineAvailability(int facilityId, DateTime date)
    {
        const string loggingHeader = "Thực hiện Get Timeline Availability sân";
        if (!CanAccessFacility(facilityId))
            return Unauthorized<List<CourtTimelineAvailabilityResponse>>("Bạn không có quyền truy cập cơ sở này.");

        var timeline = await _unitOfWork.ICourtRepository.GetTimelineAvailabilityAsync(facilityId, date);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(timeline); }
    }

    public async Task<Result<CourtWeeklyTimelineResponse>> GetWeeklyTimelineAvailability(int courtId, DateTime date)
    {
        const string loggingHeader = "Thực hiện Get Weekly Timeline Availability sân";
        if (!await CanAccessCourt(courtId))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập sân này.")}"); return Unauthorized<CourtWeeklyTimelineResponse>("Bạn không có quyền truy cập sân này."); }

        // Lấy cấu hình hệ thống hiện tại để lấy BufferDurationMinutes và các ràng buộc khác
        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();

        var dailyTimeline = await _unitOfWork.ICourtRepository.GetWeeklyTimelineAvailabilityAsync(courtId, date);

        var response = new CourtWeeklyTimelineResponse
        {
            BufferDurationMinutes = settings.BufferDurationMinutes,
            Timeline = dailyTimeline
        };

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(response); }
    }
}
