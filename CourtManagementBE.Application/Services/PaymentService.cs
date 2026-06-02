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
    public PaymentService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<PaymentResponse>>> GetAll(QueryResource query)
    {
        var bookingIds = await GetScopedBookingIds();
        var bookingGroupIds = await GetScopedBookingGroupIds();
        var page = await _unitOfWork.IPaymentRepository.FindAll(
            x => (x.BookingID.HasValue && bookingIds.Contains(x.BookingID.Value)) ||
                 (x.BookingGroupID.HasValue && bookingGroupIds.Contains(x.BookingGroupID.Value)),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Payments, PaymentResponse>(page));
    }

    public async Task<Result<List<PaymentResponse>>> GetByBooking(Guid bookingId)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<PaymentResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IPaymentRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<PaymentResponse>>(list));
    }

    public async Task<Result<PaymentResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null) return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        if (!await CanAccessPayment(entity)) return Unauthorized<PaymentResponse>("Bạn không có quyền truy cập thanh toán này.");
        return Success(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Create(PaymentRequest request)
    {
        if (request.BookingID.HasValue && !await CanAccessBooking(request.BookingID.Value))
            return Unauthorized<PaymentResponse>("Bạn không có quyền tạo thanh toán cho booking này.");
        if (request.BookingGroupID.HasValue && !await CanAccessBookingGroup(request.BookingGroupID.Value))
            return Unauthorized<PaymentResponse>("Bạn không có quyền tạo thanh toán cho nhóm đặt sân này.");
        if (!request.BookingID.HasValue && !request.BookingGroupID.HasValue)
            return BadRequest<PaymentResponse>("Thanh toán phải thuộc về một booking hoặc một nhóm đặt sân.");

        var entity = _mapper.Map<Payments>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Update(int id, PaymentRequest request)
    {
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null) return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        if (!await CanAccessPayment(entity)) return Unauthorized<PaymentResponse>("Bạn không có quyền cập nhật thanh toán này.");
        
        if (request.BookingID.HasValue && !await CanAccessBooking(request.BookingID.Value))
            return Unauthorized<PaymentResponse>("Bạn không có quyền gán thanh toán này cho booking đã chọn.");
        if (request.BookingGroupID.HasValue && !await CanAccessBookingGroup(request.BookingGroupID.Value))
            return Unauthorized<PaymentResponse>("Bạn không có quyền gán thanh toán này cho nhóm đặt sân đã chọn.");

        _mapper.Map(request, entity);
        _unitOfWork.IPaymentRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
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
