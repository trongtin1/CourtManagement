using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Enums;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class BookingGroupService : BaseService, IBookingGroupService
{
    public BookingGroupService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<BookingGroupResponse>>> GetAll(QueryResource query)
    {
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.IBookingGroupRepository.FindAll(
            x => _currentUser == null || (_currentUser.IsSuperAdmin && workingFacilityId == null) || x.FacilityID == workingFacilityId,
            include: q => q.Include(x => x.RecurringConfig!),
            pagingSpecification: new PagingSpecification(query));

        return Success(MapPageList<BookingGroups, BookingGroupResponse>(page));
    }

    public async Task<Result<List<BookingGroupResponse>>> GetByCustomer(int customerId)
    {
        var workingFacilityId = WorkingFacilityId;
        var list = await _unitOfWork.IBookingGroupRepository.FindList(
            x => x.CustomerID == customerId && (_currentUser == null || (_currentUser.IsSuperAdmin && workingFacilityId == null) || x.FacilityID == workingFacilityId),
            include: q => q.Include(x => x.RecurringConfig!));

        return Success(_mapper.Map<List<BookingGroupResponse>>(list));
    }

    public async Task<Result<BookingGroupResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân.");
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            return Unauthorized<BookingGroupResponse>("Bạn không có quyền truy cập nhóm đặt sân này.");

        return Success(_mapper.Map<BookingGroupResponse>(entity));
    }

    public async Task<Result<string>> Create(BookingGroupRequest request)
    {
        if (request.FacilityID.HasValue && !CanAccessFacility(request.FacilityID.Value))
            return Unauthorized<string>("Bạn không có quyền thao tác trên cơ sở này.");

        if (request.RecurringConfig is null)
        {
            return BadRequest<string>("Thiếu cấu hình lịch định kỳ.");
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
            request.Note
        );

        if (!string.IsNullOrEmpty(errorMessage))
        {
            return BadRequest<string>(errorMessage);
        }

        return Created<string>("Tạo nhóm đặt sân thành công.");
    }

    public async Task<Result<BookingGroupResponse>> Update(int id, BookingGroupRequest request)
    {
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân.");
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            return Unauthorized<BookingGroupResponse>("Bạn không có quyền cập nhật nhóm đặt sân này.");
        if (request.RecurringConfig is null)
            return BadRequest<BookingGroupResponse>("Thiếu cấu hình lịch định kỳ.");

        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        entity.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            _unitOfWork.IBookingGroupRepository.Update(entity);

            // 1. Xóa toàn bộ booking tương lai chưa thanh toán/hoàn thành của nhóm này trước khi sinh lại
            var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7)).ToDateTime(TimeOnly.MinValue);
            var existingBookings = await _unitOfWork.IBookingRepository.FindList(x =>
                x.BookingGroupID == entity.BookingGroupID &&
                x.BookingDate >= today &&
                x.Status != BookingStatusConstants.Cancelled &&
                x.Status != BookingStatusConstants.Completed);

            foreach (var b in existingBookings)
            {
                var slots = await _unitOfWork.IBookingSlotRepository.FindList(s => s.BookingID == b.BookingID);
                if (slots.Count > 0) _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
                _unitOfWork.IBookingRepository.Remove(b);
            }
            await _unitOfWork.SaveChangesAsync();

            // 2. Cập nhật cấu hình lặp
            RecurringConfigs config;
            if (entity.RecurringConfig is not null)
            {
                _mapper.Map(request.RecurringConfig, entity.RecurringConfig);
                _unitOfWork.IRecurringConfigRepository.Update(entity.RecurringConfig);
                config = entity.RecurringConfig;
            }
            else
            {
                config = _mapper.Map<RecurringConfigs>(request.RecurringConfig);
                config.BookingGroupID = entity.BookingGroupID;
                await _unitOfWork.IRecurringConfigRepository.Add(config);
            }
            await _unitOfWork.SaveChangesAsync();

            // 3. Sinh lịch mới và kiểm tra trùng
            var generateResult = await GenerateBookingsForRecurringConfig(entity, config);
            if (!generateResult.IsSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return BadRequest<BookingGroupResponse>(generateResult.Message);
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            var resultEntity = await _unitOfWork.IBookingGroupRepository.FindFirst(
                x => x.BookingGroupID == entity.BookingGroupID,
                include: q => q.Include(x => x.RecurringConfig!));

            return Success(_mapper.Map<BookingGroupResponse>(resultEntity));
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Result<BookingGroupResponse>> Cancel(int id, string reason)
    {
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) return NotFound<BookingGroupResponse>("Không tìm thấy nhóm đặt sân.");
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            return Unauthorized<BookingGroupResponse>("Bạn không có quyền hủy nhóm đặt sân này.");

        if (entity.Status == BookingGroupStatus.Cancelled)
            return BadRequest<BookingGroupResponse>("Nhóm đặt sân đã được hủy trước đó.");

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
            foreach (var booking in bookings)
            {
                booking.Status = BookingStatusConstants.Cancelled;
                booking.CancellationReason = $"Hủy theo nhóm đặt sân: {reason}";
                booking.CancelledAt = DateTimeOffset.UtcNow;
                booking.ModifiedDate = DateTimeOffset.UtcNow;
                booking.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;

                _unitOfWork.IBookingRepository.Update(booking);

                // Giải phóng các khung giờ khóa trong ngày
                var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == booking.BookingID);
                if (slots.Count > 0)
                {
                    _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
                }
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return Success(_mapper.Map<BookingGroupResponse>(entity), "Hủy nhóm đặt sân và toàn bộ lịch đi kèm thành công.");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingGroupRepository.FindFirst(
            x => x.BookingGroupID == id,
            include: q => q.Include(x => x.RecurringConfig!));

        if (entity is null) return NotFound<bool>("Không tìm thấy nhóm đặt sân.");
        if (entity.FacilityID.HasValue && !CanAccessFacility(entity.FacilityID.Value))
            return Unauthorized<bool>("Bạn không có quyền xóa nhóm đặt sân này.");

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

            return Success(true, "Xóa nhóm đặt sân thành công.");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    // ── Helper sinh lịch và kiểm tra trùng lịch ───────────────────────────
    private async Task<Result<bool>> GenerateBookingsForRecurringConfig(BookingGroups group, RecurringConfigs config)
    {
        var daysOfWeek = ParseDaysOfWeek(config.DaysOfWeek);
        if (daysOfWeek.Count == 0)
        {
            return BadRequest<bool>("Danh sách ngày lặp trong tuần không hợp lệ.");
        }

        // Tính các ngày trong khoảng
        var datesToGenerate = new List<DateOnly>();
        var cursor = config.StartDate;
        while (cursor <= config.EndDate)
        {
            int dow = (int)cursor.DayOfWeek;
            if (daysOfWeek.Contains(dow))
            {
                datesToGenerate.Add(cursor);
            }
            cursor = cursor.AddDays(1);
        }

        if (datesToGenerate.Count == 0)
        {
            return BadRequest<bool>("Không tìm thấy ngày nào khớp với lịch lặp trong khoảng thời gian đã chọn.");
        }

        var newBookings = new List<Bookings>();
        var newSlots = new List<BookingSlots>();

        // Kiểm tra từng ngày để xem có bị trùng lịch sân bãi hay không
        foreach (var targetDate in datesToGenerate)
        {
            var targetDateTime = targetDate.ToDateTime(TimeOnly.MinValue);

            // Truy vấn slot trùng giờ trên cùng một CourtID tại ngày này
            var overlappingSlots = await _unitOfWork.IBookingSlotRepository.FindList(x =>
                x.CourtID == config.CourtID &&
                x.BookingDate.Date == targetDateTime.Date &&
                x.StartTime < config.EndTime &&
                x.EndTime > config.StartTime
            );

            if (overlappingSlots.Count > 0)
            {
                var bookingIds = overlappingSlots.Select(s => s.BookingID).Distinct().ToList();
                var activeBookings = await _unitOfWork.IBookingRepository.FindList(b =>
                    bookingIds.Contains(b.BookingID) && b.Status != BookingStatusConstants.Cancelled);

                if (activeBookings.Count > 0)
                {
                    return BadRequest<bool>($"Trùng lịch tại ngày {targetDate:dd/MM/yyyy} vào lúc {config.StartTime:hh\\:mm} - {config.EndTime:hh\\:mm}. Khung giờ này đã được đặt.");
                }
            }

            // Tính toán giá tiền thực tế cho buổi đặt này theo các slot
            var availability = await _unitOfWork.ICourtRepository.GetSlotAvailabilityAsync(config.CourtID, targetDateTime);
            decimal bookingTotalAmount = 0;
            var matchedSlots = availability.Where(x =>
                TimeSpan.TryParse(x.StartTime, out var slotStart) &&
                TimeSpan.TryParse(x.EndTime, out var slotEnd) &&
                TrimToSecond(slotStart) >= TrimToSecond(config.StartTime) &&
                TrimToSecond(slotEnd) <= TrimToSecond(config.EndTime)
            ).ToList();

            if (matchedSlots.Count > 0)
            {
                bookingTotalAmount = matchedSlots.Sum(s => s.Price);
            }

            var bookingId = Guid.NewGuid();
            var booking = new Bookings
            {
                BookingID = bookingId,
                CourtID = config.CourtID,
                CustomerID = group.CustomerID ?? 0,
                BookingGroupID = group.BookingGroupID,
                BookingDate = targetDateTime,
                Status = BookingStatusConstants.Confirmed,
                Note = $"[Đặt định kỳ] Nhóm ID: #{group.BookingGroupID}",
                TotalAmount = bookingTotalAmount,
                CreatedDate = DateTimeOffset.UtcNow,
                ModifiedDate = DateTimeOffset.UtcNow,
                CreatedBy = _currentUser?.UserId?.ToString() ?? "system",
                ModifiedBy = _currentUser?.UserId?.ToString() ?? "system"
            };

            var slot = new BookingSlots
            {
                BookingID = bookingId,
                CourtID = config.CourtID,
                BookingDate = targetDateTime,
                StartTime = config.StartTime,
                EndTime = config.EndTime
            };

            newBookings.Add(booking);
            newSlots.Add(slot);
        }

        // Thực hiện ghi danh sách booking con vào DB
        foreach (var b in newBookings)
        {
            await _unitOfWork.IBookingRepository.Add(b);
        }

        await _unitOfWork.IBookingSlotRepository.AddRange(newSlots);

        // Tự động tính toán tổng tiền cho Nhóm Đặt Sân dựa trên các booking thực tế được sinh ra
        group.TotalAmount = newBookings.Sum(x => x.TotalAmount);
        _unitOfWork.IBookingGroupRepository.Update(group);

        await _unitOfWork.SaveChangesAsync();

        return Success(true);
    }

    private static TimeSpan TrimToSecond(TimeSpan value)
        => new(value.Days, value.Hours, value.Minutes, value.Seconds);

    private static HashSet<int> ParseDaysOfWeek(string daysOfWeek)
    {
        if (string.IsNullOrWhiteSpace(daysOfWeek))
            return [];

        return daysOfWeek
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => int.TryParse(s, out var n) ? (int?)n : null)
            .Where(n => n.HasValue && n >= 0 && n <= 6)
            .Select(n => n!.Value)
            .ToHashSet();
    }
}
