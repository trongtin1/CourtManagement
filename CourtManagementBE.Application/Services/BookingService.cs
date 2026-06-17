using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Application.Helpers;
using CourtManagementBE.Application.Extensions;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.DTOs.Response;
using CourtManagementBE.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using CourtManagementBE.Application.Resources;

namespace CourtManagementBE.Application.Services;

public class BookingService : BaseService, IBookingService
{
    private readonly ILogger<BookingService> _logger;
    private readonly IIdempotencyService _idempotencyService;

    public BookingService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<BookingService> logger, IIdempotencyService idempotencyService)
        : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
        _idempotencyService = idempotencyService;
    }

    public async Task<Result<PageList<BookingResponse>>> GetAll(BookingResource query)
    {
        const string loggingHeader = "Lấy danh sách đặt sân";
        var page = await _unitOfWork.IBookingRepository.FindAll(
            x => (!query.BookingGroupID.HasValue || x.BookingGroupID == query.BookingGroupID.Value)
                && (string.IsNullOrEmpty(query.Status) || x.Status == query.Status),
            pagingSpecification: new PagingSpecification(query));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân thành công.");
        return Success(MapPageList<Bookings, BookingResponse>(page));
    }

    public async Task<Result<List<BookingResponse>>> GetByCustomer(int customerId)
    {
        const string loggingHeader = "Lấy danh sách đặt sân theo khách hàng";
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CustomerID == customerId && courtIds.Contains(x.CourtID));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân theo khách hàng thành công.");
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByCourt(int courtId)
    {
        const string loggingHeader = "Lấy danh sách đặt sân theo sân";
        if (!await CanAccessCourt(courtId))
        {
            _logger.LogWarning($"{loggingHeader} - Bạn không có quyền truy cập sân này.");
            return Unauthorized<List<BookingResponse>>("Bạn không có quyền truy cập sân này.");
        }

        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CourtID == courtId);

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân theo sân thành công.");
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByStatus(string status)
    {
        const string loggingHeader = "Lấy danh sách đặt sân theo trạng thái";
        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(
            x => x.Code == status || x.StatusName.ToLower() == status.ToLower());
        if (statusEntity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Trạng thái đặt sân không hợp lệ.");
            return BadRequest<List<BookingResponse>>("Trạng thái đặt sân không hợp lệ.");
        }
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.Status == statusEntity.Code && courtIds.Contains(x.CourtID));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân theo trạng thái thành công.");
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByDate(DateTime date)
    {
        const string loggingHeader = "Lấy danh sách đặt sân theo ngày";
        var courtIds = await GetScopedCourtIds();
        var dateOnly = DateOnly.FromDateTime(date);
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.BookingDate == dateOnly && courtIds.Contains(x.CourtID));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân theo ngày thành công.");
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<BookingResponse>> GetById(Guid id)
    {
        const string loggingHeader = "Lấy danh sách đặt sân theo ID";
        var entity = await _unitOfWork.IBookingRepository.FindFirst(
            x => x.BookingID == id,
            include: query => query
                .Include(x => x.Court)
                .Include(x => x.Customer)
                .Include(x => x.BookingGroup)
                .Include(x => x.CancellationReasonNavigation)
                .Include(x => x.BookingSlots)
                .Include(x => x.BookingServices)
                .Include(x => x.BookingCombos),
            splitQuery: true
        );
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy đơn đặt sân.");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Bạn không có quyền truy cập đơn đặt sân này.");
            return Unauthorized<BookingResponse>("Bạn không có quyền truy cập đơn đặt sân này.");
        }

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách đặt sân theo ID thành công.");
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Create(BookingRequest request)
    {
        const string loggingHeader = "Tạo đơn đặt sân";
        if (!await CanAccessCourt(request.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Bạn không có quyền tạo booking cho sân này.");
            return Unauthorized<BookingResponse>("Bạn không có quyền tạo booking cho sân này.");
        }

        var entity = _mapper.Map<Bookings>(request);
        entity.BookingID = Guid.NewGuid();
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Tạo đơn đặt sân thành công.");
        return Created(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> CreateFull(CreateFullBookingRequest request, string? idempotencyKey = null)
    {
        const string loggingHeader = "Tạo đơn đặt sân đầy đủ";
        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            var cachedResponse = await _idempotencyService.GetResponseAsync<Result<BookingResponse>>(idempotencyKey, request);
            if (cachedResponse != null)
            {
                _logger.LogInformation($"{loggingHeader} - Trả về kết quả đã xử lý trước đó từ Idempotency Key: {idempotencyKey}");
                return cachedResponse;
            }
        }

        if (request.Slots.Count == 0)
        {
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì chưa chọn khung giờ.");
            return BadRequest<BookingResponse>("Vui lòng chọn ít nhất một khung giờ.");
        }

        if (!await CanAccessCourt(request.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Bạn không có quyền tạo booking đầy đủ.");
            return Unauthorized<BookingResponse>("Bạn không có quyền tạo booking cho sân này.");
        }

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null || !court.IsActive)
        {
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì sân không khả dụng.");
            return BadRequest<BookingResponse>("Sân không tồn tại hoặc đang ngừng hoạt động.");
        }

        var customer = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == request.CustomerID);
        if (customer is null)
        {
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì không tìm thấy khách hàng.");
            return BadRequest<BookingResponse>("Khách hàng không tồn tại.");
        }

        var bookingDate = request.BookingDate;
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
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì giờ kết thúc không lớn hơn giờ bắt đầu.");
            return BadRequest<BookingResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var overlapInRequest = normalizedSlots
            .SelectMany((slot, index) => normalizedSlots.Skip(index + 1), (slot, next) => new { slot, next })
            .Any(x => x.slot.StartTime < x.next.EndTime && x.slot.EndTime > x.next.StartTime);
        if (overlapInRequest)
        {
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì các khung giờ yêu cầu bị trùng nhau.");
            return BadRequest<BookingResponse>("Các khung giờ được chọn bị trùng nhau.");
        }

        var priceRules = await _unitOfWork.ICourtPriceRepository.GetCourtPriceRulesAsync(request.CourtID, bookingDate.ToDateTime(TimeOnly.MinValue));
        var targetDayOfWeek = (int)bookingDate.DayOfWeek;
        var dayRules = priceRules.Where(r => r.DayOfWeek == targetDayOfWeek).ToList();

        decimal courtTotal = 0;
        foreach (var requestedSlot in normalizedSlots)
        {
            var overlappingRules = dayRules
                .Where(r => r.IsActive && r.StartTime < requestedSlot.EndTime && r.EndTime > requestedSlot.StartTime)
                .ToList();

            if (overlappingRules.Any(r => r.IsLocked))
            {
                _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì khung giờ bị khóa.");
                return Conflict<BookingResponse>("Một hoặc nhiều khung giờ đã bị khóa (bảo trì hoặc sự kiện).");
            }

            if (overlappingRules.Count == 0)
            {
                _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì khung giờ nằm ngoài giờ hoạt động.");
                return BadRequest<BookingResponse>("Khung giờ được chọn không thuộc giờ hoạt động của sân.");
            }

            decimal slotCost = 0;
            foreach (var rule in overlappingRules)
            {
                var intersectStart = rule.StartTime > requestedSlot.StartTime ? rule.StartTime : requestedSlot.StartTime;
                var intersectEnd = rule.EndTime < requestedSlot.EndTime ? rule.EndTime : requestedSlot.EndTime;
                if (intersectStart < intersectEnd)
                {
                    var durationMinutes = (decimal)(intersectEnd - intersectStart).TotalMinutes;
                    slotCost += (durationMinutes / 60m) * rule.Price;
                }
            }
            courtTotal += slotCost;
        }

        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();
        var validationError = await ValidateBookingConstraints(null, request.CourtID, bookingDate, normalizedSlots, settings);
        if (validationError != null)
        {
            _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại do vi phạm ràng buộc booking.");
            return BadRequest<BookingResponse>(validationError);
        }

        var requestedCombos = request.Combos.Where(x => x.Quantity > 0).ToList();
        var comboIds = requestedCombos.Select(x => x.ComboID).ToList();
        var combosList = await _unitOfWork.IComboRepository.FindList(x => comboIds.Contains(x.ComboID));
        var combosMap = combosList.ToDictionary(x => x.ComboID);

        var comboLines = new List<BookingCombos>();
        decimal comboTotal = 0;
        Combos? firstCombo = null;
        foreach (var requestedCombo in requestedCombos)
        {
            if (!combosMap.TryGetValue(requestedCombo.ComboID, out var combo) || !combo.IsActive)
            {
                _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì combo không khả dụng.");
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

        var requestedServices = request.Services.Where(x => x.Quantity > 0).ToList();
        var serviceIds = requestedServices.Select(x => x.ServiceID).ToList();
        var servicesList = await _unitOfWork.IServiceRepository.FindList(x => serviceIds.Contains(x.ServiceID));
        var servicesMap = servicesList.ToDictionary(x => x.ServiceID);

        var serviceLines = new List<BookingServices>();
        decimal serviceTotal = 0;
        foreach (var requestedService in requestedServices)
        {
            if (!servicesMap.TryGetValue(requestedService.ServiceID, out var service) || !service.IsActive || !CanAccessService(service))
            {
                _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì dịch vụ không khả dụng hoặc không thể truy cập.");
                return BadRequest<BookingResponse>("Dịch vụ không tồn tại, đã ngừng hoạt động hoặc không thuộc cơ sở hiện tại.");
            }

            if (service.MinQuantity > 0 && requestedService.Quantity < service.MinQuantity)
            {
                _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì số lượng dịch vụ thấp hơn mức tối thiểu.");
                return BadRequest<BookingResponse>($"Số lượng dịch vụ {service.ServiceName} thấp hơn giới hạn tối thiểu.");
            }

            if (service.IsTrackStock)
            {
                if (service.StockQuantity < requestedService.Quantity)
                {
                    _logger.LogWarning($"{loggingHeader} - Tạo đơn đặt sân thất bại vì tồn kho dịch vụ không đủ.");
                    return BadRequest<BookingResponse>($"Dịch vụ {service.ServiceName} không đủ tồn kho (Hiện còn: {service.StockQuantity}).");
                }
                service.StockQuantity -= requestedService.Quantity;
                _unitOfWork.IServiceRepository.Update(service);
            }

            var price = service.Price;
            var lineTotal = price * requestedService.Quantity;
            serviceTotal += lineTotal;
            serviceLines.Add(new BookingServices
            {
                ServiceID = requestedService.ServiceID,
                Quantity = requestedService.Quantity,
                UnitPrice = price,
                TotalAmount = lineTotal,
                CreatedDate = DateTimeOffset.UtcNow,
                ModifiedDate = DateTimeOffset.UtcNow
            });
        }

        if (firstCombo is not null)
        {
            courtTotal = CalculateComboCourtTotal(firstCombo, normalizedSlots, priceRules, bookingDate);
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

        foreach (var line in comboLines)
        {
            line.BookingID = bookingId;
        }

        try
        {
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

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Tạo booking đầy đủ thành công. BookingID={booking.BookingID}, CourtID={booking.CourtID}, CustomerID={booking.CustomerID}, BookingDate={booking.BookingDate}, SốSlot={bookingSlots.Count}, SốDịchVụ={serviceLines.Count}, SốCombo={comboLines.Count}, TổngTiền={booking.TotalAmount:N0}đ");
            
            var result = Created(_mapper.Map<BookingResponse>(booking));
            if (!string.IsNullOrEmpty(idempotencyKey))
            {
                await _idempotencyService.SaveResponseAsync(idempotencyKey, request, result);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Tạo booking đầy đủ thất bại trong quá trình giao dịch. CourtID={request.CourtID}, CustomerID={request.CustomerID}, BookingDate={request.BookingDate}");
            return Conflict<BookingResponse>("Không thể tạo booking vì dữ liệu đã thay đổi. Vui lòng tải lại khung giờ và thử lại.");
        }
    }

    public async Task<Result<BookingResponse>> Update(Guid id, BookingRequest request)
    {
        const string loggingHeader = "Update Booking";
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy booking. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền cập nhật booking. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền cập nhật booking này.");
        }
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IBookingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Cập nhật booking thành công. BookingID={entity.BookingID}, CourtID={entity.CourtID}, CustomerID={entity.CustomerID}, TổngTiền={entity.TotalAmount:N0}đ");
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Cancel(Guid id, BookingRequest request)
    {
        const string loggingHeader = "Cancel Booking";
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy booking. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền hủy booking. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền hủy booking này.");
        }
        if (entity.Status == BookingStatusConstants.Cancelled)
        {
            _logger.LogWarning($"{loggingHeader} - Từ chối hủy booking vì booking đã bị hủy trước đó. BookingID={id}");
            return BadRequest<BookingResponse>("Đơn đặt sân đã bị hủy trước đó.");
        }

        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
        var earliestStartTime = TimeSpan.Zero;
        if (slots != null && slots.Count > 0)
        {
            earliestStartTime = slots[0].StartTime;
            foreach (var slot in slots)
            {
                if (slot.StartTime < earliestStartTime)
                {
                    earliestStartTime = slot.StartTime;
                }
            }
        }

        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();
        DateTime currentLocalTime = settings.GetLocalTime();

        var localBookingStart = entity.BookingDate.ToDateTime(TimeOnly.FromTimeSpan(earliestStartTime));

        // 1. Tính toán số tiền hoàn/phạt bằng C# Helper (C# làm bộ não)
        var calculationResult = CancellationPolicyCalculator.Calculate(new CancellationFeeCalculationRequest
        {
            OriginalPaidAmount = entity.PaidAmount,
            BookingStartLocal = localBookingStart,
            CurrentLocalTime = currentLocalTime,
            Settings = settings,
            BookingDate = entity.BookingDate,
            IsFromGroup = false,
            CustomReason = request.CancellationReason
        });

        // 2. Thực thi giao dịch DB bằng Stored Procedure (SP làm chân tay)
        var performedBy = _currentUser?.UserId?.ToString() ?? "system";
        var errorMessage = await _unitOfWork.IBookingRepository.CancelBookingAsync(
            bookingId: id,
            cancellationReason: request.CancellationReason,
            refundAmount: calculationResult.RefundAmount,
            penaltyAmount: calculationResult.PenaltyAmount,
            refundNote: calculationResult.RefundNote,
            penaltyNote: calculationResult.PenaltyNote,
            performedBy: performedBy,
            historyNote: calculationResult.HistoryNote
        );

        if (!string.IsNullOrEmpty(errorMessage))
        {
            _logger.LogWarning($"{loggingHeader} - Hủy booking thất bại từ stored procedure. BookingID={id}, ErrorMessage={errorMessage}");
            return Conflict<BookingResponse>(errorMessage);
        }

        _logger.LogInformation($"{loggingHeader} - Hủy booking thành công. BookingID={id}, CourtID={entity.CourtID}, LýDo={request.CancellationReason ?? "Không có lý do"}, TiềnHoàn={calculationResult.RefundAmount:N0}đ, TiềnPhạt={calculationResult.PenaltyAmount:N0}đ");

        return Success<BookingResponse>(null, "Hủy đơn đặt sân thành công.");
    }

    public async Task<Result<BookingResponse>> UpdateStatus(Guid id, string status)
    {
        const string loggingHeader = "Update Booking Status";
        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(
            x => x.Code == status || x.StatusName.ToLower() == status.ToLower());
        if (statusEntity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Trạng thái booking không hợp lệ. BookingID={id}, Status={status}");
            return BadRequest<BookingResponse>("Trạng thái không hợp lệ.");
        }
        var newStatus = statusEntity.Code;

        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy booking. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền cập nhật trạng thái booking. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền cập nhật booking này.");
        }

        if (entity.Status == newStatus)
        {
            _logger.LogInformation($"{loggingHeader} - Booking đã ở trạng thái được yêu cầu. BookingID={id}, Status={newStatus}");
            return Success(_mapper.Map<BookingResponse>(entity));
        }

        // Ràng buộc quy tắc chuyển đổi trạng thái vòng đời Booking (State Machine Guard)
        if (!entity.CanTransitionTo(newStatus))
        {
            var oldStatusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == entity.Status);
            string oldName = oldStatusEntity?.StatusName ?? entity.Status;
            string newName = statusEntity.StatusName;
            _logger.LogWarning($"{loggingHeader} - Chuyển trạng thái booking không hợp lệ. BookingID={id}, OldStatus={entity.Status}, NewStatus={newStatus}");
            return BadRequest<BookingResponse>($"Không thể chuyển đổi trạng thái đặt sân từ '{oldName}' sang '{newName}'.");
        }

        // Ngăn chặn chuyển sang trạng thái Completed nếu chưa thanh toán đủ
        if (newStatus == BookingStatusConstants.Completed && entity.PaidAmount < entity.TotalAmount)
        {
            _logger.LogWarning($"{loggingHeader} - Không thể hoàn tất booking vì chưa thanh toán đủ. BookingID={id}, PaidAmount={entity.PaidAmount}, TotalAmount={entity.TotalAmount}");
            return BadRequest<BookingResponse>("Không thể hoàn thành đơn đặt sân khi chưa thanh toán đủ tiền.");
        }

        try
        {
            var oldStatus = entity.Status;
            entity.Status = newStatus;
            entity.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(entity);

            // Nếu chuyển sang Cancelled, dọn dẹp slots và hoàn trả kho
            if (newStatus == BookingStatusConstants.Cancelled)
            {
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

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Cập nhật trạng thái booking thành công. BookingID={id}, OldStatus={oldStatus}, NewStatus={newStatus}");

            return Success(_mapper.Map<BookingResponse>(entity), "Cập nhật trạng thái thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Cập nhật trạng thái booking thất bại trong quá trình giao dịch. BookingID={id}, RequestedStatus={newStatus}");
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    }

    public async Task<Result<BookingResponse>> Pay(Guid id, BookingPaymentRequest request, string? idempotencyKey = null)
    {
        const string loggingHeader = "Pay Booking";
        if (!string.IsNullOrEmpty(idempotencyKey))
        {
            var cachedResponse = await _idempotencyService.GetResponseAsync<Result<BookingResponse>>(idempotencyKey, new { Id = id, Request = request });
            if (cachedResponse != null)
            {
                _logger.LogInformation($"{loggingHeader} - Trả về kết quả đã xử lý trước đó từ Idempotency Key: {idempotencyKey}");
                return cachedResponse;
            }
        }

        if (request.Amount <= 0)
        {
            _logger.LogWarning($"{loggingHeader} - Số tiền thanh toán không hợp lệ. BookingID={id}, Amount={request.Amount}");
            return BadRequest<BookingResponse>("Số tiền thanh toán phải lớn hơn 0.");
        }

        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy booking. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền thanh toán booking. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền thực hiện thanh toán cho booking này.");
        }

        if (entity.Status == BookingStatusConstants.Cancelled)
        {
            _logger.LogWarning($"{loggingHeader} - Không thể thanh toán booking đã bị hủy. BookingID={id}");
            return BadRequest<BookingResponse>("Không thể thanh toán cho booking đã bị hủy.");
        }

        if (entity.PaidAmount >= entity.TotalAmount)
        {
            _logger.LogWarning($"{loggingHeader} - Booking đã được thanh toán đầy đủ. BookingID={id}, PaidAmount={entity.PaidAmount}, TotalAmount={entity.TotalAmount}");
            return BadRequest<BookingResponse>("Booking đã thanh toán đủ.");
        }

        var remainingAmount = entity.TotalAmount - entity.PaidAmount;
        if (request.Amount > remainingAmount)
        {
            _logger.LogWarning($"{loggingHeader} - Số tiền thanh toán vượt quá số tiền còn lại. BookingID={id}, Amount={request.Amount}, RemainingAmount={remainingAmount}");
            return BadRequest<BookingResponse>($"Số tiền thanh toán vượt quá số còn lại ({remainingAmount:N0}).");
        }

        bool isGroupDeposit = entity.BookingGroupID.HasValue && request.DeductFromGroupDeposit;
        BookingGroups? group = null;

        if (isGroupDeposit)
        {
            group = await _unitOfWork.IBookingGroupRepository.FindFirst(x => x.BookingGroupID == entity.BookingGroupID!.Value);
            if (group is null)
            {
                _logger.LogWarning($"{loggingHeader} - Không tìm thấy nhóm booking để khấu trừ tiền cọc. BookingID={id}, BookingGroupID={entity.BookingGroupID}");
                return NotFound<BookingResponse>("Không tìm thấy nhóm đặt sân định kỳ tương ứng.");
            }

            if (request.Amount > group.PaidAmount)
            {
                _logger.LogWarning($"{loggingHeader} - Số dư cọc của nhóm không đủ. BookingID={id}, BookingGroupID={entity.BookingGroupID}, Amount={request.Amount}, GroupPaidAmount={group.PaidAmount}");
                return BadRequest<BookingResponse>($"Số dư cọc của nhóm không đủ để khấu trừ (Số dư hiện tại: {group.PaidAmount:N0} đ).");
            }
        }

        try
        {
            var oldPaidAmount = entity.PaidAmount;
            var oldStatus = entity.Status;

            // 1. Tạo Payment record
            var payment = new Payments
            {
                BookingID = id,
                BookingGroupID = entity.BookingGroupID,
                Amount = request.Amount,
                PaymentMethod = "cash",
                PaymentDate = DateTime.UtcNow,
                Status = "success",
                Note = isGroupDeposit ? $"[Khấu trừ quỹ cọc nhóm] {request.Note}".Trim() : request.Note,
                CreatedDate = DateTimeOffset.UtcNow
            };
            await _unitOfWork.IPaymentRepository.Add(payment);

            // 2. Cập nhật PaidAmount của Booking
            entity.PaidAmount += request.Amount;

            // 3. Tự động chuyển sang Confirmed nếu đã thanh toán đủ tiền hoặc đủ tiền đặt cọc tối thiểu (nếu bật)
            var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();
            decimal requiredAmountToConfirm = entity.TotalAmount;
            if (settings.EnableDeposit)
            {
                requiredAmountToConfirm = entity.TotalAmount * settings.DepositPercent / 100m;
            }

            if (entity.PaidAmount >= requiredAmountToConfirm && entity.Status == BookingStatusConstants.Pending)
            {
                entity.Status = BookingStatusConstants.Confirmed;
            }

            entity.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(entity);

            // 4. Nếu là khấu trừ cọc nhóm, trừ trực tiếp số dư cọc của nhóm
            if (isGroupDeposit && group is not null)
            {
                group.PaidAmount -= request.Amount;
                group.ModifiedDate = DateTimeOffset.UtcNow;
                _unitOfWork.IBookingGroupRepository.Update(group);
            }

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "PAYMENT",
                oldValue: $"PaidAmount: {oldPaidAmount}, Status: {oldStatus}",
                newValue: $"PaidAmount: {entity.PaidAmount}, Status: {entity.Status}",
                note: isGroupDeposit
                    ? $"Cấn trừ số tiền cọc nhóm {request.Amount:N0}. Ghi chú: {request.Note}"
                    : $"Thanh toán số tiền {request.Amount:N0} bằng {payment.PaymentMethod}. Ghi chú: {request.Note}"
            );

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Thanh toán booking thành công. BookingID={id}, SốTiền={request.Amount}, TiềnĐãThanhToánCũ={oldPaidAmount}, TiềnĐãThanhToánMới={entity.PaidAmount}, TrạngTháiMới={entity.Status}, KhấuTrừCọcNhóm={isGroupDeposit}");
            
            var result = Success(_mapper.Map<BookingResponse>(entity), "Thanh toán thành công.");
            if (!string.IsNullOrEmpty(idempotencyKey))
            {
                await _idempotencyService.SaveResponseAsync(idempotencyKey, new { Id = id, Request = request }, result);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Thanh toán booking thất bại trong quá trình giao dịch. BookingID={id}, SốTiền={request.Amount}");
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi thực hiện thanh toán.");
        }
    }

    public async Task<Result<BookingResponse>> Refund(Guid id, BookingRefundRequest request)
    {
        const string loggingHeader = "Hoàn tiền đặt sân";
        if (request.Amount <= 0)
        {
            _logger.LogWarning($"{loggingHeader} - Số tiền hoàn trả không hợp lệ. BookingID={id}, Amount={request.Amount}");
            return BadRequest<BookingResponse>("Số tiền hoàn trả phải lớn hơn 0.");
        }

        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy đơn đặt sân. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền hoàn tiền đơn đặt sân. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền thực hiện hoàn tiền cho booking này.");
        }

        if (entity.PaidAmount <= 0)
        {
            _logger.LogWarning($"{loggingHeader} - Từ chối hoàn tiền vì booking chưa có số tiền đã thanh toán. BookingID={id}");
            return BadRequest<BookingResponse>("Booking chưa được thanh toán hoặc số tiền đã thanh toán bằng 0.");
        }

        if (request.Amount > entity.PaidAmount)
        {
            _logger.LogWarning($"{loggingHeader} - Số tiền hoàn trả vượt quá số tiền đã thanh toán. BookingID={id}, Amount={request.Amount}, PaidAmount={entity.PaidAmount}");
            return BadRequest<BookingResponse>($"Số tiền hoàn trả không được vượt quá số tiền đã thanh toán ({entity.PaidAmount:N0}).");
        }

        try
        {
            var oldPaidAmount = entity.PaidAmount;

            // 1. Tạo Payment record hoàn tiền
            var payment = new Payments
            {
                BookingID = id,
                BookingGroupID = entity.BookingGroupID,
                Amount = -request.Amount,
                RefundedAmount = request.Amount,
                PaymentMethod = "cash",
                PaymentDate = DateTime.UtcNow,
                Status = "refunded",
                Note = request.Note,
                CreatedDate = DateTimeOffset.UtcNow
            };
            await _unitOfWork.IPaymentRepository.Add(payment);

            // 2. Cấn trừ PaidAmount của Booking
            entity.PaidAmount -= request.Amount;
            entity.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(entity);

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "REFUND",
                oldValue: $"PaidAmount: {oldPaidAmount}",
                newValue: $"PaidAmount: {entity.PaidAmount}",
                note: $"Hoàn tiền số tiền {request.Amount:N0}. Ghi chú: {request.Note}"
            );

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Hoàn tiền booking thành công. BookingID={id}, SốTiền={request.Amount}, TiềnĐãThanhToánCũ={oldPaidAmount}, TiềnĐãThanhToánMới={entity.PaidAmount}");
            return Success(_mapper.Map<BookingResponse>(entity), "Hoàn tiền thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Hoàn tiền booking thất bại trong quá trình giao dịch. BookingID={id}, SốTiền={request.Amount}");
            return Conflict<BookingResponse>("Đã xảy ra lỗi khi thực hiện hoàn tiền.");
        }
    }

    public async Task<Result<BookingResponse>> Reschedule(Guid id, RescheduleBookingRequest request)
    {
        const string loggingHeader = "Dời lịch đặt sân";
        if (!await CanAccessCourt(request.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền dời lịch đặt sân. BookingID={id}, NewCourtID={request.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<BookingResponse>("Bạn không có quyền dời lịch đặt sân này.");
        }

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (booking is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy đơn đặt sân. BookingID={id}");
            return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        }

        var statusEntity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == booking.Status);
        if (statusEntity is null || !statusEntity.CanReschedule)
        {
            _logger.LogWarning($"{loggingHeader} - Trạng thái đơn đặt sân không cho phép dời lịch. BookingID={id}, Status={booking.Status}");
            return BadRequest<BookingResponse>("Trạng thái hiện tại của đơn đặt sân không cho phép dời lịch.");
        }

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null || !court.IsActive)
        {
            _logger.LogWarning($"{loggingHeader} - Sân mới không khả dụng để dời lịch. BookingID={id}, NewCourtID={request.CourtID}");
            return BadRequest<BookingResponse>("Sân không tồn tại hoặc đang ngừng hoạt động.");
        }

        var bookingDate = request.BookingDate;
        var requestedSlot = new CreateFullBookingSlotRequest
        {
            StartTime = TrimToSecond(request.StartTime),
            EndTime = TrimToSecond(request.EndTime)
        };

        if (requestedSlot.StartTime >= requestedSlot.EndTime)
        {
            _logger.LogWarning($"{loggingHeader} - Khoảng thời gian dời lịch không hợp lệ. BookingID={id}, StartTime={requestedSlot.StartTime}, EndTime={requestedSlot.EndTime}");
            return BadRequest<BookingResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var myOldSlots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);

        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1) ?? new SystemSettings();
        var validationError = await ValidateBookingConstraints(id, request.CourtID, bookingDate, new List<CreateFullBookingSlotRequest> { requestedSlot }, settings);
        if (validationError != null)
        {
            _logger.LogWarning($"{loggingHeader} - Dời lịch thất bại do vi phạm ràng buộc booking. BookingID={id}, NewCourtID={request.CourtID}, BookingDate={bookingDate}, Reason={validationError}");
            return BadRequest<BookingResponse>(validationError);
        }

        var priceRules = await _unitOfWork.ICourtPriceRepository.GetCourtPriceRulesAsync(request.CourtID, bookingDate.ToDateTime(TimeOnly.MinValue));
        var targetDayOfWeek = (int)bookingDate.DayOfWeek;
        var dayRules = priceRules.Where(r => r.DayOfWeek == targetDayOfWeek).ToList();

        var overlappingRules = dayRules
            .Where(r => r.IsActive && r.StartTime < requestedSlot.EndTime && r.EndTime > requestedSlot.StartTime)
            .ToList();

        if (overlappingRules.Any(r => r.IsLocked))
        {
            _logger.LogWarning($"{loggingHeader} - Dời lịch thất bại vì khung giờ mới bị khóa. BookingID={id}, NewCourtID={request.CourtID}, BookingDate={bookingDate}, StartTime={requestedSlot.StartTime}, EndTime={requestedSlot.EndTime}");
            return Conflict<BookingResponse>("Khung giờ mới được chọn đã bị khóa (bảo trì hoặc sự kiện).");
        }

        if (overlappingRules.Count == 0)
        {
            _logger.LogWarning($"{loggingHeader} - Dời lịch thất bại vì khung giờ mới nằm ngoài giờ hoạt động. BookingID={id}, NewCourtID={request.CourtID}, BookingDate={bookingDate}, StartTime={requestedSlot.StartTime}, EndTime={requestedSlot.EndTime}");
            return BadRequest<BookingResponse>("Khung giờ mới được chọn không thuộc giờ hoạt động của sân.");
        }

        decimal courtTotal = 0;
        foreach (var rule in overlappingRules)
        {
            var intersectStart = rule.StartTime > requestedSlot.StartTime ? rule.StartTime : requestedSlot.StartTime;
            var intersectEnd = rule.EndTime < requestedSlot.EndTime ? rule.EndTime : requestedSlot.EndTime;
            if (intersectStart < intersectEnd)
            {
                var durationMinutes = (decimal)(intersectEnd - intersectStart).TotalMinutes;
                courtTotal += (durationMinutes / 60m) * rule.Price;
            }
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
                courtTotal = CalculateComboCourtTotal(combo, new List<CreateFullBookingSlotRequest> { requestedSlot }, priceRules, bookingDate);
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

        try
        {
            var oldCourtId = booking.CourtID;
            var oldBookingDate = booking.BookingDate;
            var oldStartTime = myOldSlots.Count > 0 ? myOldSlots.Min(x => x.StartTime) : TimeSpan.Zero;
            var oldEndTime = myOldSlots.Count > 0 ? myOldSlots.Max(x => x.EndTime) : TimeSpan.Zero;
            var oldTotalAmount = booking.TotalAmount;

            if (myOldSlots.Count > 0)
            {
                _unitOfWork.IBookingSlotRepository.RemoveRange(myOldSlots);
            }

            await _unitOfWork.IBookingSlotRepository.AddRange(newBookingSlots);

            booking.CourtID = request.CourtID;
            booking.BookingDate = bookingDate;
            booking.TotalAmount = courtTotal + serviceTotal;
            booking.ModifiedDate = DateTimeOffset.UtcNow;

            _unitOfWork.IBookingRepository.Update(booking);

            // Ghi BookingHistory
            await WriteBookingHistory(
                bookingId: id,
                action: "RESCHEDULE",
                oldValue: $"CourtID: {oldCourtId}, Date: {oldBookingDate:yyyy-MM-dd}, Time: {oldStartTime}-{oldEndTime}, Price: {oldTotalAmount}",
                newValue: $"CourtID: {booking.CourtID}, Date: {booking.BookingDate:yyyy-MM-dd}, Time: {requestedSlot.StartTime}-{requestedSlot.EndTime}, Price: {booking.TotalAmount}",
                note: $"Dời lịch đặt sân sang sân {booking.CourtID} ngày {booking.BookingDate:yyyy-MM-dd} từ {requestedSlot.StartTime} đến {requestedSlot.EndTime}"
            );

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Dời lịch đặt sân thành công. BookingID={id}, CourtIDCũ={oldCourtId}, CourtIDMới={booking.CourtID}, NgàyCũ={oldBookingDate}, NgàyMới={booking.BookingDate}, GiờBắtĐầuMới={requestedSlot.StartTime}, GiờKếtThúcMới={requestedSlot.EndTime}, TổngTiềnMới={booking.TotalAmount}");
            return Success(_mapper.Map<BookingResponse>(booking), "Dời lịch đặt sân thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Dời lịch đặt sân thất bại trong quá trình giao dịch. BookingID={id}, CourtIDMới={request.CourtID}, BookingDate={request.BookingDate}");
            return Conflict<BookingResponse>("Không thể dời lịch đặt sân. Vui lòng tải lại trang và thử lại.");
        }
    }

    public async Task<Result<bool>> Delete(Guid id)
    {
        const string loggingHeader = "Xóa lịch đặt sân";
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy đơn đặt sân. BookingID={id}");
            return NotFound<bool>("Không tìm thấy đơn đặt sân.");
        }
        if (!await CanAccessCourt(entity.CourtID))
        {
            _logger.LogWarning($"{loggingHeader} - Người dùng không có quyền xóa đơn đặt sân. BookingID={id}, CourtID={entity.CourtID}, UserID={_currentUser?.UserId}");
            return Unauthorized<bool>("Bạn không có quyền xóa đơn đặt sân này.");
        }
        var slots = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == id);
        var services = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == id);

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
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Xóa booking thành công. BookingID={id}, CourtID={entity.CourtID}, TrạngThái={entity.Status}, SốSlot={slots.Count}, SốDịchVụ={services.Count}");
            return Success(true, "Xóa đơn đặt sân thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"{loggingHeader} - Xóa booking thất bại trong quá trình giao dịch. BookingID={id}");
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
        List<CreateFullBookingSlotRequest> selectedSlots,
        List<CourtPriceResponse> priceRules,
        DateOnly bookingDate)
    {
        var totalCost = 0m;
        var targetDayOfWeek = (int)bookingDate.DayOfWeek;
        var dayRules = priceRules.Where(r => r.DayOfWeek == targetDayOfWeek).ToList();

        foreach (var slot in selectedSlots)
        {
            var overlappingRules = dayRules
                .Where(r => r.IsActive && r.StartTime < slot.EndTime && r.EndTime > slot.StartTime)
                .ToList();

            decimal baseCost = 0;
            foreach (var rule in overlappingRules)
            {
                var intersectStart = rule.StartTime > slot.StartTime ? rule.StartTime : slot.StartTime;
                var intersectEnd = rule.EndTime < slot.EndTime ? rule.EndTime : slot.EndTime;
                if (intersectStart < intersectEnd)
                {
                    var durationMinutes = (decimal)(intersectEnd - intersectStart).TotalMinutes;
                    baseCost += (durationMinutes / 60m) * rule.Price;
                }
            }

            var durationHours = (decimal)(slot.EndTime - slot.StartTime).TotalHours;
            var comboHours = (decimal)combo.DurationHours;

            if (durationHours <= comboHours)
            {
                totalCost += combo.ComboPrice;
            }
            else
            {
                var extraHours = durationHours - comboHours;
                var averageHourlyRate = durationHours > 0 ? baseCost / durationHours : 0;
                totalCost += combo.ComboPrice + extraHours * averageHourlyRate;
            }
        }

        return totalCost;
    }

    public async Task<Result<List<BookingHistoryResponse>>> GetHistory(Guid? bookingId)
    {
        const string loggingHeader = "Get Booking History";
        System.Linq.Expressions.Expression<Func<BookingHistories, bool>> filter = x => true;
        if (bookingId.HasValue)
        {
            filter = x => x.BookingID == bookingId.Value;
        }

        var list = await _unitOfWork.IBookingHistoryRepository.FindList(filter);
        var ordered = list.OrderByDescending(x => x.CreatedAt).ToList();

        _logger.LogInformation($"{loggingHeader} - Lấy lịch sử booking thành công. BookingID={bookingId}, SốLượng={ordered.Count}");
        return Success(_mapper.Map<List<BookingHistoryResponse>>(ordered));
    }

    public async Task<Result<List<BookingStatusResponse>>> GetStatuses()
    {
        const string loggingHeader = "Get Booking Statuses";
        var list = await _unitOfWork.IBookingStatusRepository.FindList(
            x => true,
            orderBy: q => q.OrderBy(x => x.Code));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách trạng thái booking thành công. SốLượng={list.Count}");
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

    private async Task<string?> ValidateBookingConstraints(
        Guid? currentBookingId,
        int courtId,
        DateOnly bookingDate,
        List<CreateFullBookingSlotRequest> requestedSlots,
        SystemSettings settings)
    {
        // 0. Check Max Pre-booking Days
        var localTime = settings.GetLocalTime();
        var currentDate = DateOnly.FromDateTime(localTime);
        if (bookingDate < currentDate)
        {
            return "Không thể đặt lịch cho ngày trong quá khứ.";
        }
        if (bookingDate > currentDate.AddDays(settings.MaxPreBookingDays))
        {
            return $"Chỉ cho phép đặt sân trước tối đa {settings.MaxPreBookingDays} ngày.";
        }

        // 1. Check Duration Limits
        var totalDurationMinutes = requestedSlots.Sum(x => (x.EndTime - x.StartTime).TotalMinutes);
        if (totalDurationMinutes < settings.MinBookingDurationMinutes)
        {
            return $"Thời lượng đặt tối thiểu là {settings.MinBookingDurationMinutes} phút.";
        }
        if (totalDurationMinutes > settings.MaxBookingDurationMinutes)
        {
            return $"Thời lượng đặt tối đa là {settings.MaxBookingDurationMinutes} phút.";
        }

        // 2. Check Overlap including Buffer Duration
        var buffer = TimeSpan.FromMinutes(settings.BufferDurationMinutes);
        var sameDaySlots = await _unitOfWork.IBookingSlotRepository.FindList(x =>
            x.CourtID == courtId && x.BookingDate == bookingDate && x.BookingID != currentBookingId);

        // Filter only slots from active bookings
        var activeBookingIds = sameDaySlots.Select(x => x.BookingID).Distinct().ToList();
        var activeBookings = await _unitOfWork.IBookingRepository.FindList(x =>
            activeBookingIds.Contains(x.BookingID) && x.Status != BookingStatusConstants.Cancelled);
        var activeBookingIdSet = activeBookings.Select(x => x.BookingID).ToHashSet();

        var activeSameDaySlots = sameDaySlots.Where(x => activeBookingIdSet.Contains(x.BookingID)).ToList();

        var overlappingSlots = activeSameDaySlots
            .Where(x => requestedSlots.Any(slot =>
                slot.StartTime < x.EndTime + buffer &&
                slot.EndTime + buffer > x.StartTime))
            .ToList();

        if (overlappingSlots.Count > 0)
        {
            return "Một hoặc nhiều khung giờ đã bị trùng hoặc nằm trong khoảng thời gian đệm dọn sân (Buffer) của booking khác.";
        }

        // 3. Check No-Crumb Policy (MinAllowableGapMinutes)
        if (settings.MinAllowableGapMinutes > 0)
        {
            var newStart = requestedSlots.Min(x => x.StartTime);
            var newEnd = requestedSlots.Max(x => x.EndTime);

            // Find closest active booking slot before newStart
            var slotsBefore = activeSameDaySlots
                .Where(x => x.EndTime <= newStart)
                .OrderByDescending(x => x.EndTime)
                .ToList();

            var minGap = TimeSpan.FromMinutes(settings.MinAllowableGapMinutes);

            var boundaryBefore = slotsBefore.Count > 0 ? slotsBefore.First().EndTime + buffer : settings.OpeningTime;
            var leftGap = newStart - boundaryBefore;
            if (leftGap > TimeSpan.Zero && leftGap < minGap)
            {
                return $"Đặt lịch để lại khoảng trống quá ngắn phía trước ({leftGap.TotalMinutes} phút). Vui lòng đặt sát ca trước ({boundaryBefore.ToString(@"hh\:mm")}) hoặc lùi giờ lại.";
            }

            // Find closest active booking slot after newEnd
            var slotsAfter = activeSameDaySlots
                .Where(x => x.StartTime >= newEnd)
                .OrderBy(x => x.StartTime)
                .ToList();

            var boundaryAfter = slotsAfter.Count > 0 ? slotsAfter.First().StartTime - buffer : settings.ClosingTime;
            var rightGap = boundaryAfter - newEnd;
            if (rightGap > TimeSpan.Zero && rightGap < minGap)
            {
                return $"Đặt lịch để lại khoảng trống quá ngắn phía sau ({rightGap.TotalMinutes} phút). Vui lòng đặt sát ca sau ({boundaryAfter.ToString(@"hh\:mm")}) hoặc đổi giờ.";
            }
        }

        return null;
    }


}
