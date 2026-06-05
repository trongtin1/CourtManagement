using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class PaymentService : BaseService, IPaymentService
{
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<PaymentService> logger)
        : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<PaymentResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách thanh toán";
        var bookingIds = await GetScopedBookingIds();
        var bookingGroupIds = await GetScopedBookingGroupIds();
        var page = await _unitOfWork.IPaymentRepository.FindAll(
            x => (x.BookingID.HasValue && bookingIds.Contains(x.BookingID.Value)) ||
                 (x.BookingGroupID.HasValue && bookingGroupIds.Contains(x.BookingGroupID.Value)),
            pagingSpecification: new PagingSpecification(query));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách thanh toán thành công. BookingScope={bookingIds.Count}, BookingGroupScope={bookingGroupIds.Count}, PageIndex={query.Page}, PageSize={query.PageSize}, SốLượng={page.Items.Count}");
        return Success(MapPageList<Payments, PaymentResponse>(page));
    }

    public async Task<Result<List<PaymentResponse>>> GetByBooking(Guid bookingId)
    {
        const string loggingHeader = "Lấy thanh toán theo booking";
        if (!await CanAccessBooking(bookingId))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền truy cập booking. BookingID={bookingId}, UserID={_currentUser?.UserId}");
            return Unauthorized<List<PaymentResponse>>("Bạn không có quyền truy cập booking này.");
        }
        var list = await _unitOfWork.IPaymentRepository.FindList(x => x.BookingID == bookingId);

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách thanh toán theo booking thành công. BookingID={bookingId}, SốLượng={list.Count}");
        return Success(_mapper.Map<List<PaymentResponse>>(list));
    }

    public async Task<Result<PaymentResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy thanh toán theo ID";
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy thanh toán. PaymentID={id}");
            return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        }
        if (!await CanAccessPayment(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền truy cập thanh toán. PaymentID={id}, BookingID={entity.BookingID}, BookingGroupID={entity.BookingGroupID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền truy cập thanh toán này.");
        }

        _logger.LogInformation($"{loggingHeader} - Lấy thanh toán thành công. PaymentID={entity.PaymentID}, BookingID={entity.BookingID}, BookingGroupID={entity.BookingGroupID}, Amount={entity.Amount}, Status={entity.Status}");
        return Success(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Create(PaymentRequest request)
    {
        const string loggingHeader = "Tạo thanh toán";
        if (request.BookingID.HasValue && !await CanAccessBooking(request.BookingID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền tạo thanh toán cho booking. BookingID={request.BookingID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền tạo thanh toán cho booking này.");
        }
        if (request.BookingGroupID.HasValue && !await CanAccessBookingGroup(request.BookingGroupID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền tạo thanh toán cho nhóm booking. BookingGroupID={request.BookingGroupID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền tạo thanh toán cho nhóm đặt sân này.");
        }
        if (!request.BookingID.HasValue && !request.BookingGroupID.HasValue)
        {
            _logger.LogWarning($"{loggingHeader} - Thiếu BookingID và BookingGroupID.");
            return BadRequest<PaymentResponse>("Thanh toán phải thuộc về một booking hoặc một nhóm đặt sân.");
        }

        var entity = _mapper.Map<Payments>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Tạo thanh toán thành công. PaymentID={entity.PaymentID}, BookingID={entity.BookingID}, BookingGroupID={entity.BookingGroupID}, Amount={entity.Amount}, Status={entity.Status}");
        return Created(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Update(int id, PaymentRequest request)
    {
        const string loggingHeader = "Cập nhật thanh toán";
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy thanh toán. PaymentID={id}");
            return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        }
        if (!await CanAccessPayment(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền cập nhật thanh toán. PaymentID={id}, BookingID={entity.BookingID}, BookingGroupID={entity.BookingGroupID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền cập nhật thanh toán này.");
        }
        
        if (request.BookingID.HasValue && !await CanAccessBooking(request.BookingID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền gán thanh toán cho booking. PaymentID={id}, BookingID={request.BookingID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền gán thanh toán này cho booking đã chọn.");
        }
        if (request.BookingGroupID.HasValue && !await CanAccessBookingGroup(request.BookingGroupID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền gán thanh toán cho nhóm booking. PaymentID={id}, BookingGroupID={request.BookingGroupID}, UserID={_currentUser?.UserId}");
            return Unauthorized<PaymentResponse>("Bạn không có quyền gán thanh toán này cho nhóm đặt sân đã chọn.");
        }

        _mapper.Map(request, entity);
        _unitOfWork.IPaymentRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Cập nhật thanh toán thành công. PaymentID={entity.PaymentID}, BookingID={entity.BookingID}, BookingGroupID={entity.BookingGroupID}, Amount={entity.Amount}, Status={entity.Status}");
        return Success(_mapper.Map<PaymentResponse>(entity));
    }

    private async Task<List<Guid>> GetScopedBookingIds()
    {
        var courtIds = await GetScopedCourtIds();
        var bookings = await _unitOfWork.IBookingRepository.FindList(x => courtIds.Contains(x.CourtID));
        return bookings.Select(x => x.BookingID).ToList();
    }

    private async Task<List<int>> GetScopedBookingGroupIds()
    {
        var workingFacilityId = WorkingFacilityId;
        if (_currentUser is null || (_currentUser.IsSuperAdmin && workingFacilityId is null))
        {
            var allGroups = await _unitOfWork.IBookingGroupRepository.FindList(_ => true);
            return allGroups.Select(x => x.BookingGroupID).ToList();
        }

        if (workingFacilityId is null) return [];
        var groups = await _unitOfWork.IBookingGroupRepository.FindList(x => x.FacilityID == workingFacilityId);
        return groups.Select(x => x.BookingGroupID).ToList();
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }

    private async Task<bool> CanAccessBookingGroup(int bookingGroupId)
    {
        var group = await _unitOfWork.IBookingGroupRepository.FindFirst(x => x.BookingGroupID == bookingGroupId);
        return group is not null && (!group.FacilityID.HasValue || CanAccessFacility(group.FacilityID.Value));
    }

    private async Task<bool> CanAccessPayment(Payments payment)
    {
        if (payment.BookingID.HasValue) return await CanAccessBooking(payment.BookingID.Value);
        if (payment.BookingGroupID.HasValue) return await CanAccessBookingGroup(payment.BookingGroupID.Value);
        return false;
    }
}
