using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Domain.Enums;

namespace CourtManagementBE.Application.Services;

public class BookingService : BaseService, IBookingService
{
    public BookingService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<BookingResponse>>> GetAll(QueryResource query)
    {
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.IBookingRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Bookings, BookingResponse>(page));
    }

    public async Task<Result<List<BookingResponse>>> GetByCustomer(int customerId)
    {
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CustomerID == customerId && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByCourt(int courtId)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<BookingResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByStatus(string status)
    {
        if (!Enum.TryParse<BookingStatus>(status, true, out var enumStatus))
        {
            return BadRequest<List<BookingResponse>>("Trạng thái đặt sân không hợp lệ.");
        }
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.Status == enumStatus && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByDate(DateTime date)
    {
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.BookingDate.Date == date.Date && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<BookingResponse>> GetById(Guid id)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền truy cập booking này.");
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Create(BookingRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền tạo booking cho sân này.");

        var entity = _mapper.Map<Bookings>(request);
        entity.BookingID = Guid.NewGuid();
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> CreateFull(CreateFullBookingRequest request)
    {
        if (request.Slots.Count == 0)
        {
            return BadRequest<BookingResponse>("Vui lòng chọn ít nhất một khung giờ.");
        }

        if (!await CanAccessCourt(request.CourtID))
        {
            return Unauthorized<BookingResponse>("Bạn không có quyền tạo booking cho sân này.");
        }

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null || !court.IsActive)
        {
            return BadRequest<BookingResponse>("Sân không tồn tại hoặc đang ngừng hoạt động.");
        }

        var customer = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == request.CustomerID);
        if (customer is null)
        {
            return BadRequest<BookingResponse>("Khách hàng không tồn tại.");
        }

        var bookingDate = request.BookingDate.Date;
        var normalizedSlots = request.Slots
            .Select(x => new CreateFullBookingSlotRequest
            {
                StartTime = TrimToSecond(x.StartTime),
                EndTime = TrimToSecond(x.EndTime)
            })
            .DistinctBy(x => new { x.StartTime, x.EndTime })
            .OrderBy(x => x.StartTime)
            .ToList();

        if (normalizedSlots.Any(x => x.StartTime >= x.EndTime))
        {
            return BadRequest<BookingResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var overlapInRequest = normalizedSlots
            .SelectMany((slot, index) => normalizedSlots.Skip(index + 1), (slot, next) => new { slot, next })
            .Any(x => x.slot.StartTime < x.next.EndTime && x.slot.EndTime > x.next.StartTime);
        if (overlapInRequest)
        {
            return BadRequest<BookingResponse>("Các khung giờ được chọn bị trùng nhau.");
        }

        var availability = await _unitOfWork.ICourtRepository.GetSlotAvailabilityAsync(request.CourtID, bookingDate);
        decimal courtTotal = 0;
        foreach (var requestedSlot in normalizedSlots)
        {
            var matchedSlot = availability.FirstOrDefault(x =>
                TimeSpan.TryParse(x.StartTime, out var startTime) &&
                TimeSpan.TryParse(x.EndTime, out var endTime) &&
                TrimToSecond(startTime) == requestedSlot.StartTime &&
                TrimToSecond(endTime) == requestedSlot.EndTime);

            if (matchedSlot is null)
            {
                return BadRequest<BookingResponse>("Khung giờ được chọn không thuộc lịch đặt sân hợp lệ.");
            }

            if (matchedSlot.IsLocked || matchedSlot.IsBooked)
            {
                return Conflict<BookingResponse>("Một hoặc nhiều khung giờ đã bị khóa hoặc đã được đặt.");
            }

            courtTotal += matchedSlot.Price;
        }

        var sameDaySlots = await _unitOfWork.IBookingSlotRepository.FindList(x =>
            x.CourtID == request.CourtID && x.BookingDate.Date == bookingDate);
        var existingSlots = sameDaySlots
            .Where(x => normalizedSlots.Any(slot => slot.StartTime < x.EndTime && slot.EndTime > x.StartTime))
            .ToList();

        if (existingSlots.Count > 0)
        {
            var bookingIds = existingSlots.Select(x => x.BookingID).Distinct().ToList();
            var activeBookings = await _unitOfWork.IBookingRepository.FindList(x =>
                bookingIds.Contains(x.BookingID) && x.Status != BookingStatus.Cancelled);

            if (activeBookings.Count > 0)
            {
                return Conflict<BookingResponse>("Một hoặc nhiều khung giờ đã được đặt bởi booking khác.");
            }
        }

        Combos? combo = null;
        if (request.ComboID is not null)
        {
            combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == request.ComboID.Value);
            if (combo is null || !combo.IsActive)
            {
                return BadRequest<BookingResponse>("Combo không tồn tại hoặc đang ngừng hoạt động.");
            }
        }

        var serviceLines = new List<BookingServices>();
        decimal serviceTotal = 0;
        foreach (var requestedService in request.Services.Where(x => x.Quantity > 0))
        {
            var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == requestedService.ServiceID);
            if (service is null || !service.IsActive || !CanAccessService(service))
            {
                return BadRequest<BookingResponse>("Dịch vụ không tồn tại, đã ngừng hoạt động hoặc không thuộc cơ sở hiện tại.");
            }

            if (service.MaxQuantity > 0 && requestedService.Quantity > service.MaxQuantity)
            {
                return BadRequest<BookingResponse>($"Số lượng dịch vụ {service.ServiceName} vượt quá giới hạn.");
            }

            if (service.MinQuantity > 0 && requestedService.Quantity < service.MinQuantity)
            {
                return BadRequest<BookingResponse>($"Số lượng dịch vụ {service.ServiceName} thấp hơn giới hạn tối thiểu.");
            }

            var price = await GetCurrentServicePrice(requestedService.ServiceID);
            if (price is null)
            {
                return BadRequest<BookingResponse>($"Dịch vụ {service.ServiceName} chưa có giá hiện hành.");
            }

            var lineTotal = price.Value * requestedService.Quantity;
            serviceTotal += lineTotal;
            serviceLines.Add(new BookingServices
            {
                ServiceID = requestedService.ServiceID,
                Quantity = requestedService.Quantity,
                UnitPrice = price.Value,
                DiscountAmount = 0,
                TotalAmount = lineTotal,
                Status = "active",
                CreatedDate = DateTimeOffset.UtcNow,
                ModifiedDate = DateTimeOffset.UtcNow
            });
        }

        if (combo is not null)
        {
            courtTotal = CalculateComboCourtTotal(combo, normalizedSlots.Count, availability, normalizedSlots);
        }

        var bookingId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var booking = new Bookings
        {
            BookingID = bookingId,
            CourtID = request.CourtID,
            CustomerID = request.CustomerID,
            BookingDate = bookingDate,
            ComboID = request.ComboID,
            Status = BookingStatus.Pending,
            Note = request.Note,
            TotalAmount = courtTotal + serviceTotal,
            CreatedDate = now,
            ModifiedDate = now
        };

        var bookingSlots = normalizedSlots.Select(x => new BookingSlots
        {
            BookingID = bookingId,
            CourtID = request.CourtID,
            BookingDate = bookingDate,
            StartTime = x.StartTime,
            EndTime = x.EndTime
        }).ToList();

        foreach (var line in serviceLines)
        {
            line.BookingID = bookingId;
        }

        try
        {
            await _unitOfWork.BeginTransactionAsync();
            await _unitOfWork.IBookingRepository.Add(booking);
            await _unitOfWork.IBookingSlotRepository.AddRange(bookingSlots);
            if (serviceLines.Count > 0)
            {
                await _unitOfWork.IBookingServiceRepository.AddRange(serviceLines);
            }

            await _unitOfWork.CommitTransactionAsync();
            return Created(_mapper.Map<BookingResponse>(booking));
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<BookingResponse>("Không thể tạo booking vì dữ liệu đã thay đổi. Vui lòng tải lại khung giờ và thử lại.");
        }
    }

    public async Task<Result<BookingResponse>> Update(Guid id, BookingRequest request)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền cập nhật booking này.");
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IBookingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Cancel(Guid id, BookingRequest request)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền hủy booking này.");
        if (entity.Status == BookingStatus.Cancelled) return BadRequest<BookingResponse>("Đơn đặt sân đã bị hủy trước đó.");

        entity.Status = BookingStatus.Cancelled;
        entity.CancellationReason = request.CancellationReason;
        entity.CancelledAt = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
        await _unitOfWork.BeginTransactionAsync();
        _unitOfWork.IBookingRepository.Update(entity);
        if (slots.Count > 0)
        {
            _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
        }
        await _unitOfWork.CommitTransactionAsync();
        return Success(_mapper.Map<BookingResponse>(entity), "Hủy đơn đặt sân thành công.");
    }

    public async Task<Result<bool>> Delete(Guid id)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa booking này.");
        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
        var services = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);
        await _unitOfWork.BeginTransactionAsync();
        if (slots.Count > 0)
        {
            _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
        }
        if (services.Count > 0)
        {
            _unitOfWork.IBookingServiceRepository.RemoveRange(services);
        }
        _unitOfWork.IBookingRepository.Remove(entity);
        await _unitOfWork.CommitTransactionAsync();
        return Success(true, "Xóa đơn đặt sân thành công.");
    }

    private static TimeSpan TrimToSecond(TimeSpan value)
        => new(value.Days, value.Hours, value.Minutes, value.Seconds);

    private bool CanAccessService(Domain.Entities.Services service)
        => service.FacilityID is null || CanAccessFacility(service.FacilityID.Value);

    private async Task<decimal?> GetCurrentServicePrice(int serviceId)
    {
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        return service?.Price;
    }

    private static decimal CalculateComboCourtTotal(
        Combos combo,
        int selectedSlotCount,
        List<CourtSlotAvailabilityResponse> availability,
        List<CreateFullBookingSlotRequest> selectedSlots)
    {
        var total = combo.ComboPrice;
        var extraCount = selectedSlotCount - combo.DurationHours;
        if (extraCount <= 0)
        {
            return total;
        }

        var selectedPrices = selectedSlots
            .Select(slot => availability.FirstOrDefault(x =>
                TimeSpan.TryParse(x.StartTime, out var startTime) &&
                TimeSpan.TryParse(x.EndTime, out var endTime) &&
                TrimToSecond(startTime) == slot.StartTime &&
                TrimToSecond(endTime) == slot.EndTime)?.Price ?? 0)
            .OrderByDescending(x => x)
            .Take(extraCount);

        return total + selectedPrices.Sum();
    }
}
