using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.DTOs.Response;
using CourtManagementBE.Domain.Constants;
using Microsoft.EntityFrameworkCore;

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
        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(
            x => x.Code == status || x.StatusName.ToLower() == status.ToLower());
        if (statusEntity is null)
        {
            return BadRequest<List<BookingResponse>>("Trạng thái đặt sân không hợp lệ.");
        }
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.Status == statusEntity.Code && courtIds.Contains(x.CourtID));
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
        var entity = await _unitOfWork.IBookingRepository.FindFirst(
            x => x.BookingID == id,
            include: query => query
                .Include(x => x.Court)
                .Include(x => x.Customer)
                .Include(x => x.BookingGroup)
                .Include(x => x.CancellationReasonNavigation)
                .Include(x => x.BookingSlots)
                .Include(x => x.BookingServices)
                .Include(x => x.BookingCombos)
        );
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
                bookingIds.Contains(x.BookingID) && x.Status != BookingStatusConstants.Cancelled);

            if (activeBookings.Count > 0)
            {
                return Conflict<BookingResponse>("Một hoặc nhiều khung giờ đã được đặt bởi booking khác.");
            }
        }

        var comboLines = new List<BookingCombos>();
        decimal comboTotal = 0;
        Combos? firstCombo = null;
        foreach (var requestedCombo in request.Combos.Where(x => x.Quantity > 0))
        {
            var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == requestedCombo.ComboID);
            if (combo is null || !combo.IsActive)
            {
                return BadRequest<BookingResponse>("Combo không tồn tại hoặc đang ngừng hoạt động.");
            }

            if (firstCombo is null)
            {
                firstCombo = combo;
            }

            var lineTotal = combo.ComboPrice * requestedCombo.Quantity;
            comboTotal += lineTotal;
            comboLines.Add(new BookingCombos
            {
                ComboID = requestedCombo.ComboID,
                Quantity = requestedCombo.Quantity,
                UnitPrice = combo.ComboPrice,
                TotalAmount = lineTotal,
                CreatedDate = DateTimeOffset.UtcNow,
                ModifiedDate = DateTimeOffset.UtcNow
            });
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

            if (service.IsTrackStock)
            {
                if (service.StockQuantity < requestedService.Quantity)
                {
                    return BadRequest<BookingResponse>($"Dịch vụ {service.ServiceName} không đủ tồn kho (Hiện còn: {service.StockQuantity}).");
                }
                service.StockQuantity -= requestedService.Quantity;
                _unitOfWork.IServiceRepository.Update(service);
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
                TotalAmount = lineTotal,
                CreatedDate = DateTimeOffset.UtcNow,
                ModifiedDate = DateTimeOffset.UtcNow
            });
        }

        if (firstCombo is not null)
        {
            courtTotal = CalculateComboCourtTotal(firstCombo, normalizedSlots.Count, availability, normalizedSlots);
        }

        var bookingId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var booking = new Bookings
        {
            BookingID = bookingId,
            CourtID = request.CourtID,
            CustomerID = request.CustomerID,
            BookingDate = bookingDate,
            Status = BookingStatusConstants.Pending,
            Note = request.Note,
            TotalAmount = courtTotal + serviceTotal + comboTotal,
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

        foreach (var line in comboLines)
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
            if (comboLines.Count > 0)
            {
                await _unitOfWork.IBookingComboRepository.AddRange(comboLines);
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
        if (entity.Status == BookingStatusConstants.Cancelled) return BadRequest<BookingResponse>("Đơn đặt sân đã bị hủy trước đó.");

        entity.Status = BookingStatusConstants.Cancelled;
        entity.CancellationReason = request.CancellationReason;
        entity.CancelledAt = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            _unitOfWork.IBookingRepository.Update(entity);
            if (slots.Count > 0)
            {
                _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
            }

            // Logic hoàn trả kho
            var bookingServices = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);
            foreach (var bs in bookingServices)
            {
                var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == bs.ServiceID);
                if (service is not null && service.IsTrackStock)
                {
                    service.StockQuantity += bs.Quantity;
                    _unitOfWork.IServiceRepository.Update(service);
                }
            }

            await _unitOfWork.CommitTransactionAsync();
            return Success(_mapper.Map<BookingResponse>(entity), "Hủy đơn đặt sân thành công.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi hủy booking.");
        }
    }

    public async Task<Result<BookingResponse>> UpdateStatus(Guid id, string status)
    {
        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(
            x => x.Code == status || x.StatusName.ToLower() == status.ToLower());
        if (statusEntity is null)
        {
            return BadRequest<BookingResponse>("Trạng thái không hợp lệ.");
        }
        var newStatus = statusEntity.Code;

        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền cập nhật booking này.");

        if (entity.Status == newStatus) return Success(_mapper.Map<BookingResponse>(entity));

        // Ràng buộc quy tắc chuyển đổi trạng thái vòng đời Booking (State Machine Guard)
        if (!IsValidTransition(entity.Status, newStatus))
        {
            var oldStatusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == entity.Status);
            string oldName = oldStatusEntity?.StatusName ?? entity.Status;
            string newName = statusEntity.StatusName;
            return BadRequest<BookingResponse>($"Không thể chuyển đổi trạng thái đặt sân từ '{oldName}' sang '{newName}'.");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var oldStatus = entity.Status;
            entity.Status = newStatus;
            entity.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(entity);

            // Nếu chuyển sang Cancelled, dọn dẹp slots và hoàn trả kho
            if (newStatus == BookingStatusConstants.Cancelled)
            {
                entity.CancelledAt = DateTimeOffset.UtcNow;
                var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
                if (slots.Count > 0)
                {
                    _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
                }

                // Logic hoàn trả kho
                var bookingServices = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);
                foreach (var bs in bookingServices)
                {
                    var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == bs.ServiceID);
                    if (service is not null && service.IsTrackStock)
                    {
                        service.StockQuantity += bs.Quantity;
                        _unitOfWork.IServiceRepository.Update(service);
                    }
                }
            }

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "STATUS_UPDATE",
                oldValue: oldStatus.ToString(),
                newValue: newStatus.ToString(),
                note: $"Cập nhật trạng thái đơn đặt sân từ {oldStatus} sang {newStatus}"
            );

            await _unitOfWork.CommitTransactionAsync();
            return Success(_mapper.Map<BookingResponse>(entity), "Cập nhật trạng thái thành công.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    }

    public async Task<Result<BookingResponse>> Pay(Guid id, BookingPaymentRequest request)
    {
        if (request.Amount <= 0)
        {
            return BadRequest<BookingResponse>("Số tiền thanh toán phải lớn hơn 0.");
        }

        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền thực hiện thanh toán cho booking này.");

        if (entity.Status == BookingStatusConstants.Cancelled)
        {
            return BadRequest<BookingResponse>("Không thể thanh toán cho booking đã bị hủy.");
        }

        if (entity.PaidAmount >= entity.TotalAmount)
        {
            return BadRequest<BookingResponse>("Booking đã thanh toán đủ.");
        }

        var remainingAmount = entity.TotalAmount - entity.PaidAmount;
        if (request.Amount > remainingAmount)
        {
            return BadRequest<BookingResponse>($"Số tiền thanh toán vượt quá số còn lại ({remainingAmount:N0}).");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var oldPaidAmount = entity.PaidAmount;
            var oldStatus = entity.Status;

            // 1. Tạo Payment record
            var payment = new Payments
            {
                BookingID = id,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                PaymentDate = DateTime.UtcNow,
                Status = "success",
                Note = request.Note,
                CreatedDate = DateTimeOffset.UtcNow
            };
            await _unitOfWork.IPaymentRepository.Add(payment);

            // 2. Cập nhật PaidAmount
            entity.PaidAmount += request.Amount;

            // 3. Nếu PaidAmount >= TotalAmount và status đang là Pending, tự động chuyển sang Confirmed
            if (entity.PaidAmount >= entity.TotalAmount && entity.Status == BookingStatusConstants.Pending)
            {
                entity.Status = BookingStatusConstants.Confirmed;
            }

            entity.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(entity);

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "PAYMENT",
                oldValue: $"PaidAmount: {oldPaidAmount}, Status: {oldStatus}",
                newValue: $"PaidAmount: {entity.PaidAmount}, Status: {entity.Status}",
                note: $"Thanh toán số tiền {request.Amount:N0} bằng {request.PaymentMethod}. Ghi chú: {request.Note}"
            );

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return Success(_mapper.Map<BookingResponse>(entity), "Thanh toán thành công.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi thực hiện thanh toán.");
        }
    }

    public async Task<Result<BookingResponse>> Reschedule(Guid id, RescheduleBookingRequest request)
    {
        if (!await CanAccessCourt(request.CourtID))
        {
            return Unauthorized<BookingResponse>("Bạn không có quyền dời booking sang sân này.");
        }

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (booking is null)
        {
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }

        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == booking.Status);
        if (statusEntity is null || !statusEntity.CanReschedule)
        {
            return BadRequest<BookingResponse>("Trạng thái hiện tại của đơn đặt sân không cho phép dời lịch.");
        }

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null || !court.IsActive)
        {
            return BadRequest<BookingResponse>("Sân không tồn tại hoặc đang ngừng hoạt động.");
        }

        var bookingDate = request.BookingDate.Date;
        var requestedSlot = new CreateFullBookingSlotRequest
        {
            StartTime = TrimToSecond(request.StartTime),
            EndTime = TrimToSecond(request.EndTime)
        };

        if (requestedSlot.StartTime >= requestedSlot.EndTime)
        {
            return BadRequest<BookingResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var myOldSlots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);

        var sameDaySlots = await _unitOfWork.IBookingSlotRepository.FindList(x =>
            x.CourtID == request.CourtID && x.BookingDate.Date == bookingDate && x.BookingID != id);
        var existingSlots = sameDaySlots
            .Where(x => requestedSlot.StartTime < x.EndTime && requestedSlot.EndTime > x.StartTime)
            .ToList();

        if (existingSlots.Count > 0)
        {
            return Conflict<BookingResponse>("Một hoặc nhiều khung giờ mới đã được đặt bởi booking khác.");
        }

        var availability = await _unitOfWork.ICourtRepository.GetSlotAvailabilityAsync(request.CourtID, bookingDate);
        decimal courtTotal = 0;
        var matchedSlots = availability
            .Where(x =>
                TimeSpan.TryParse(x.StartTime, out var startTime) &&
                TimeSpan.TryParse(x.EndTime, out var endTime) &&
                TrimToSecond(startTime) >= requestedSlot.StartTime &&
                TrimToSecond(endTime) <= requestedSlot.EndTime)
            .OrderBy(x => TimeSpan.Parse(x.StartTime))
            .ToList();

        if (matchedSlots.Count == 0 ||
            TrimToSecond(TimeSpan.Parse(matchedSlots.First().StartTime)) != requestedSlot.StartTime ||
            TrimToSecond(TimeSpan.Parse(matchedSlots.Last().EndTime)) != requestedSlot.EndTime)
        {
            return BadRequest<BookingResponse>("Khung giờ mới được chọn không thuộc lịch đặt sân hợp lệ.");
        }

        for (var i = 1; i < matchedSlots.Count; i++)
        {
            if (TrimToSecond(TimeSpan.Parse(matchedSlots[i - 1].EndTime)) != TrimToSecond(TimeSpan.Parse(matchedSlots[i].StartTime)))
            {
                return BadRequest<BookingResponse>("Khung giờ mới được chọn không thuộc lịch đặt sân hợp lệ.");
            }
        }

        foreach (var matchedSlot in matchedSlots)
        {
            var slotStart = TrimToSecond(TimeSpan.Parse(matchedSlot.StartTime));
            var slotEnd = TrimToSecond(TimeSpan.Parse(matchedSlot.EndTime));
            bool isLocked = matchedSlot.IsLocked;
            bool isBookedByOther = matchedSlot.IsBooked && !myOldSlots.Any(x =>
                x.CourtID == request.CourtID &&
                x.BookingDate.Date == bookingDate &&
                TrimToSecond(x.StartTime) == slotStart &&
                TrimToSecond(x.EndTime) == slotEnd);

            if (isLocked || isBookedByOther)
            {
                return Conflict<BookingResponse>("Một hoặc nhiều khung giờ mới đã bị khóa hoặc đã được đặt.");
            }

            courtTotal += matchedSlot.Price;
        }

        var bookingServices = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);
        decimal serviceTotal = bookingServices.Sum(x => x.TotalAmount);

        var bookingCombos = await _unitOfWork.IBookingComboRepository.FindList(x => x.BookingID == id);
        if (bookingCombos.Any())
        {
            var firstBookingCombo = bookingCombos.First();
            var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == firstBookingCombo.ComboID);
            if (combo is not null && combo.IsActive)
            {
                courtTotal = CalculateComboCourtTotal(combo, matchedSlots.Count, availability, matchedSlots.Select(x => new CreateFullBookingSlotRequest
                {
                    StartTime = TrimToSecond(TimeSpan.Parse(x.StartTime)),
                    EndTime = TrimToSecond(TimeSpan.Parse(x.EndTime))
                }).ToList());
            }
        }

        var newBookingSlots = new List<BookingSlots>
        {
            new()
            {
                BookingID = id,
                CourtID = request.CourtID,
                BookingDate = bookingDate,
                StartTime = requestedSlot.StartTime,
                EndTime = requestedSlot.EndTime
            }
        };

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var oldCourtId = booking.CourtID;
            var oldBookingDate = booking.BookingDate;
            var oldStartTime = booking.StartTime;
            var oldEndTime = booking.EndTime;
            var oldTotalAmount = booking.TotalAmount;

            if (myOldSlots.Count > 0)
            {
                _unitOfWork.IBookingSlotRepository.RemoveRange(myOldSlots);
            }

            await _unitOfWork.IBookingSlotRepository.AddRange(newBookingSlots);

            booking.CourtID = request.CourtID;
            booking.BookingDate = bookingDate;
            booking.StartTime = requestedSlot.StartTime;
            booking.EndTime = requestedSlot.EndTime;
            booking.TotalAmount = courtTotal + serviceTotal;
            booking.ModifiedDate = DateTimeOffset.UtcNow;

            _unitOfWork.IBookingRepository.Update(booking);

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "RESCHEDULE",
                oldValue: $"CourtID: {oldCourtId}, Date: {oldBookingDate:yyyy-MM-dd}, Time: {oldStartTime}-{oldEndTime}, Price: {oldTotalAmount}",
                newValue: $"CourtID: {booking.CourtID}, Date: {booking.BookingDate:yyyy-MM-dd}, Time: {booking.StartTime}-{booking.EndTime}, Price: {booking.TotalAmount}",
                note: $"Dời lịch đặt sân sang sân {booking.CourtID} ngày {booking.BookingDate:yyyy-MM-dd} từ {booking.StartTime} đến {booking.EndTime}"
            );

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return Success(_mapper.Map<BookingResponse>(booking), "Dời lịch đặt sân thành công.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<BookingResponse>("Không thể dời lịch đặt sân. Vui lòng tải lại trang và thử lại.");
        }
    }

    public async Task<Result<bool>> Delete(Guid id)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa booking này.");
        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
        var services = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            if (slots.Count > 0)
            {
                _unitOfWork.IBookingSlotRepository.RemoveRange(slots);
            }
            if (services.Count > 0)
            {
                // Nếu xóa trực tiếp booking, hoàn lại kho cho các dịch vụ (chỉ khi booking chưa cancelled vì nếu cancelled đã hoàn kho rồi)
                if (entity.Status != BookingStatusConstants.Cancelled)
                {
                    foreach (var bs in services)
                    {
                        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == bs.ServiceID);
                        if (service is not null && service.IsTrackStock)
                        {
                            service.StockQuantity += bs.Quantity;
                            _unitOfWork.IServiceRepository.Update(service);
                        }
                    }
                }
                _unitOfWork.IBookingServiceRepository.RemoveRange(services);
            }
            _unitOfWork.IBookingRepository.Remove(entity);
            await _unitOfWork.CommitTransactionAsync();
            return Success(true, "Xóa đơn đặt sân thành công.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Conflict<bool>("Đã xảy ra lỗi khi xóa booking.");
        }
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

    public async Task<Result<List<BookingHistoryResponse>>> GetHistory(Guid? bookingId)
    {
        System.Linq.Expressions.Expression<Func<BookingHistories, bool>> filter = x => true;
        if (bookingId.HasValue)
        {
            filter = x => x.BookingID == bookingId.Value;
        }

        var list = await _unitOfWork.IBookingHistoryRepository.FindList(filter);
        var ordered = list.OrderByDescending(x => x.CreatedAt).ToList();
        return Success(_mapper.Map<List<BookingHistoryResponse>>(ordered));
    }

    public async Task<Result<List<BookingStatusResponse>>> GetStatuses()
    {
        var list = await _unitOfWork.IBookingStatusRepository.FindList(
            x => true,
            orderBy: q => q.OrderBy(x => x.Code));

        return Success(_mapper.Map<List<BookingStatusResponse>>(list));
    }

    private async Task WriteBookingHistory(Guid bookingId, string action, string oldValue, string newValue, string note = "")
    {
        var log = new BookingHistories
        {
            BookingID = bookingId,
            Action = action,
            OldValue = oldValue,
            NewValue = newValue,
            Note = note,
            PerformedBy = _currentUser?.UserId?.ToString() ?? "system",
            CreatedAt = DateTimeOffset.UtcNow
        };
        await _unitOfWork.IBookingHistoryRepository.Add(log);
    }

    private static bool IsValidTransition(string currentStatus, string newStatus)
    {
        return (currentStatus, newStatus) switch
        {
            (BookingStatusConstants.Pending, BookingStatusConstants.Confirmed) => true,
            (BookingStatusConstants.Pending, BookingStatusConstants.Cancelled) => true,
            
            (BookingStatusConstants.Confirmed, BookingStatusConstants.CheckedIn) => true,
            (BookingStatusConstants.Confirmed, BookingStatusConstants.Cancelled) => true,
            (BookingStatusConstants.Confirmed, BookingStatusConstants.NoShow) => true,
            
            (BookingStatusConstants.CheckedIn, BookingStatusConstants.Completed) => true,
            
            _ => false
        };
    }
}
