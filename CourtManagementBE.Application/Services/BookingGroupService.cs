using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Application.Helpers;
using CourtManagementBE.Application.Extensions;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Enums;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Domain.Constants;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class BookingGroupService : BaseService, IBookingGroupService
{
    private readonly ILogger<BookingGroupService> _logger;

    public BookingGroupService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<BookingGroupService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<BookingGroupResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách nhóm đặt sân";
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.IBookingGroupRepository.FindAll(
            x => _currentUser == null || (_currentUser.IsSuperAdmin && workingFacilityId == null) || x.FacilityID == workingFacilityId,
            include: q => q.Include(x => x.RecurringConfig!),
            pagingSpecification: new PagingSpecification(query));

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<BookingGroups, BookingGroupResponse>(page)); }
    }

    public async Task<Result<List<BookingGroupResponse>>> GetByCustomer(int customerId)
    {
        const string loggingHeader = "Lấy nhóm đặt sân theo khách hàng";
        var workingFacilityId = WorkingFacilityId;
        var list = await _unitOfWork.IBookingGroupRepository.FindList(
            x => x.CustomerID == customerId && (_currentUser == null || (_currentUser.IsSuperAdmin && workingFacilityId == null) || x.FacilityID == workingFacilityId),
            include: q => q.Include(x => x.RecurringConfig!));

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingGroupResponse>>(list)); }
    }

    public async Task<Result<BookingGroupResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy nhóm đặt sân theo ID";
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy nhóm đặt sân.")}"); return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân."); }
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập nhóm đặt sân này.")}"); return Unauthorized<BookingGroupResponse>("Bạn không có quyền truy cập nhóm đặt sân này."); }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<BookingGroupResponse>(entity)); }
    }

    public async Task<Result<string>> Create(BookingGroupRequest request)
    {
        const string loggingHeader = "Tạo nhóm đặt sân";
        if (request.FacilityID.HasValue && !CanAccessFacility(request.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền thao tác trên cơ sở này.")}"); return Unauthorized<string>("Bạn không có quyền thao tác trên cơ sở này."); }

        if (request.RecurringConfig is null)
        {
            { _logger.LogWarning($"{loggingHeader} - {("Thiếu cấu hình lịch định kỳ.")}"); return BadRequest<string>("Thiếu cấu hình lịch định kỳ."); }
        }

        var createdBy = _currentUser?.UserId?.ToString() ?? "system";
        var startDate = request.RecurringConfig.StartDate.ToDateTime(TimeOnly.MinValue);
        var endDate = request.RecurringConfig.EndDate.ToDateTime(TimeOnly.MinValue);

        var errorMessage = await _unitOfWork.IBookingGroupRepository.CreateRecurringBookingGroupAsync(
            request.CustomerID ?? 0,
            request.FacilityID ?? 0,
            request.RecurringConfig.CourtID,
            startDate,
            endDate,
            request.RecurringConfig.StartTime,
            request.RecurringConfig.EndTime,
            request.RecurringConfig.DaysOfWeek,
            createdBy,
            request.Note,
            request.TotalAmount
        );

        if (!string.IsNullOrEmpty(errorMessage))
        {
            { _logger.LogWarning($"{loggingHeader} - {(errorMessage)}"); return BadRequest<string>(errorMessage); }
        }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created<string>("Tạo nhóm đặt sân thành công."); }
    }

    public async Task<Result<BookingGroupResponse>> Update(int id, BookingGroupRequest request)
    {
        const string loggingHeader = "Cập nhật nhóm đặt sân";
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy nhóm đặt sân.")}"); return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân."); }
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật nhóm đặt sân này.")}"); return Unauthorized<BookingGroupResponse>("Bạn không có quyền cập nhật nhóm đặt sân này."); }
        if (request.RecurringConfig is null)
            { _logger.LogWarning($"{loggingHeader} - {("Thiếu cấu hình lịch định kỳ.")}"); return BadRequest<BookingGroupResponse>("Thiếu cấu hình lịch định kỳ."); }

        var modifiedBy = _currentUser?.UserId?.ToString() ?? "system";
        var startDate = request.RecurringConfig.StartDate.ToDateTime(TimeOnly.MinValue);
        var endDate = request.RecurringConfig.EndDate.ToDateTime(TimeOnly.MinValue);

        var errorMessage = await _unitOfWork.IBookingGroupRepository.UpdateRecurringBookingGroupAsync(
            id,
            request.CustomerID ?? 0,
            request.FacilityID ?? 0,
            request.RecurringConfig.CourtID,
            startDate,
            endDate,
            request.RecurringConfig.StartTime,
            request.RecurringConfig.EndTime,
            request.RecurringConfig.DaysOfWeek,
            modifiedBy,
            request.Note,
            request.TotalAmount
        );

        if (!string.IsNullOrEmpty(errorMessage))
        {
            { _logger.LogWarning($"{loggingHeader} - {(errorMessage)}"); return BadRequest<BookingGroupResponse>(errorMessage); }
        }

        // Tải lại thực thể sau khi đã cập nhật thành công từ SP
        var updatedEntity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<BookingGroupResponse>(updatedEntity), "Cập nhật nhóm đặt sân thành công."); }
    }

    public async Task<Result<BookingGroupResponse>> Cancel(int id, string reason)
    {
        const string loggingHeader = "Thực hiện Cancel nhóm đặt sân";
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy nhóm đặt sân.")}"); return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân."); }
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền hủy nhóm đặt sân này.")}"); return Unauthorized<BookingGroupResponse>("Bạn không có quyền hủy nhóm đặt sân này."); }

        if (entity.Status == BookingGroupStatus.Cancelled)
            { _logger.LogWarning($"{loggingHeader} - {("Nhóm đặt sân đã được hủy trước đó.")}"); return BadRequest<BookingGroupResponse>("Nhóm đặt sân đã được hủy trước đó."); }

        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();
        DateTime currentLocalTime = settings.GetLocalTime();

        entity.Status = BookingGroupStatus.Cancelled;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        entity.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        entity.Note = $"{entity.Note} [Hủy nhóm: {reason}]".Trim();

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            _unitOfWork.IBookingGroupRepository.Update(entity);

            // Tự động hủy tất cả các buổi đặt sân lẻ thuộc nhóm chưa diễn ra
            var bookings = await _unitOfWork.IBookingRepository.FindList(x => x.BookingGroupID == id && x.Status != BookingStatusConstants.Cancelled);

            decimal totalGroupRefund = 0;
            var performedBy = _currentUser?.UserId?.ToString() ?? "system";

            foreach (var booking in bookings)
            {
                var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == booking.BookingID);
                var earliestStartTime = TimeSpan.Zero;
                if (slots != null && slots.Count > 0)
                {
                    earliestStartTime = slots[0].StartTime;
                    foreach (var slot in slots)
                    {
                        if (slot.StartTime < earliestStartTime) earliestStartTime = slot.StartTime;
                    }
                }

                var localBookingStart = booking.BookingDate.ToDateTime(TimeOnly.FromTimeSpan(earliestStartTime));

                // Lịch trong quá khứ không tự động hoàn trả/hủy cọc
                if (localBookingStart < currentLocalTime)
                {
                    continue;
                }

                // 1. Tính toán số tiền hoàn/phạt bằng C# Helper (C# làm bộ não)
                var calculationResult = CancellationPolicyCalculator.Calculate(new CancellationFeeCalculationRequest
                {
                    OriginalPaidAmount = booking.PaidAmount,
                    BookingStartLocal = localBookingStart,
                    CurrentLocalTime = currentLocalTime,
                    Settings = settings,
                    BookingDate = booking.BookingDate,
                    IsFromGroup = true,
                    CustomReason = reason
                });

                if (calculationResult.RefundAmount > 0)
                {
                    totalGroupRefund += calculationResult.RefundAmount;
                }

                // 2. Thực thi giao dịch DB bằng Stored Procedure (SP làm chân tay)
                var errorMessage = await _unitOfWork.IBookingRepository.CancelBookingAsync(
                    bookingId: booking.BookingID,
                    cancellationReason: $"Hủy theo nhóm đặt sân: {reason}",
                    refundAmount: calculationResult.RefundAmount,
                    penaltyAmount: calculationResult.PenaltyAmount,
                    refundNote: calculationResult.RefundNote,
                    penaltyNote: calculationResult.PenaltyNote,
                    performedBy: performedBy,
                    historyNote: calculationResult.HistoryNote
                );

                if (!string.IsNullOrEmpty(errorMessage))
                {
                    throw new Exception(errorMessage);
                }
            }

            // Đồng bộ quỹ cọc nhóm in-memory để EF lưu chính xác
            entity.PaidAmount += totalGroupRefund;
            _unitOfWork.IBookingGroupRepository.Update(entity);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<BookingGroupResponse>(entity), "Hủy nhóm đặt sân và toàn bộ lịch đi kèm thành công."); }
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            { _logger.LogWarning($"{loggingHeader} - {($"Đã xảy ra lỗi khi hủy nhóm: {ex.Message}")}"); return Conflict<BookingGroupResponse>($"Đã xảy ra lỗi khi hủy nhóm: {ex.Message}"); }
        }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa nhóm đặt sân";
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy nhóm đặt sân.")}"); return NotFound<bool>("Không tìm thấy nhóm đặt sân."); }
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa nhóm đặt sân này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa nhóm đặt sân này."); }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Xóa cấu hình lặp lại
            if (entity.RecurringConfig is not null)
            {
                _unitOfWork.IRecurringConfigRepository.Remove(entity.RecurringConfig);
            }

            // Xóa tất cả các lịch đặt thuộc nhóm (bao gồm slot và dịch vụ đính kèm)
            var bookings = await _unitOfWork.IBookingRepository.FindList(x => x.BookingGroupID == id);
            foreach (var booking in bookings)
            {
                var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == booking.BookingID);
                if (slots.Count > 0) _unitOfWork.IBookingSlotRepository.RemoveRange(slots);

                var services = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == booking.BookingID);
                if (services.Count > 0) _unitOfWork.IBookingServiceRepository.RemoveRange(services);

                _unitOfWork.IBookingRepository.Remove(booking);
            }

            _unitOfWork.IBookingGroupRepository.Remove(entity);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa nhóm đặt sân thành công."); }
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Result<BookingGroupResponse>> PayDeposit(int id, BookingPaymentRequest request)
    {
        const string loggingHeader = "Thực hiện Pay Deposit nhóm đặt sân";
        if (request.Amount <= 0)
        {
            { _logger.LogWarning($"{loggingHeader} - {("Số tiền đóng cọc phải lớn hơn 0.")}"); return BadRequest<BookingGroupResponse>("Số tiền đóng cọc phải lớn hơn 0."); }
        }

        var group = await _unitOfWork.IBookingGroupRepository.FindFirst(x => x.BookingGroupID == id);
        if (group is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy nhóm đặt sân.")}"); return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân."); }
        if (group.FacilityID.HasValue && !CanAccessFacility(group.FacilityID.Value))
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền thực hiện đóng cọc cho nhóm đặt sân này.")}"); return Unauthorized<BookingGroupResponse>("Bạn không có quyền thực hiện đóng cọc cho nhóm đặt sân này."); }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // 1. Tạo Payment record đóng cọc ở cấp nhóm (BookingGroupID != null, BookingID = null)
            var payment = new Payments
            {
                BookingGroupID = id,
                BookingID = null, // Cọc cấp nhóm
                Amount = request.Amount,
                PaymentMethod = "cash",
                PaymentDate = DateTime.UtcNow,
                Status = "success",
                Note = $"[Nạp cọc nhóm] {request.Note}".Trim(),
                CreatedDate = DateTimeOffset.UtcNow
            };
            await _unitOfWork.IPaymentRepository.Add(payment);

            // 2. Cập nhật PaidAmount ở BookingGroup
            group.PaidAmount += request.Amount;
            group.ModifiedDate = DateTimeOffset.UtcNow;
            group.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
            _unitOfWork.IBookingGroupRepository.Update(group);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            var updatedGroup = await _unitOfWork.IBookingGroupRepository.FindFirst(
                x => x.BookingGroupID == id,
                include: q => q.Include(x => x.RecurringConfig!));

            { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<BookingGroupResponse>(updatedGroup), "Nạp tiền cọc nhóm thành công."); }
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            { _logger.LogWarning($"{loggingHeader} - {("Đã xảy ra lỗi khi thực hiện nạp cọc nhóm.")}"); return Conflict<BookingGroupResponse>("Đã xảy ra lỗi khi thực hiện nạp cọc nhóm."); }
        }
    }
}
