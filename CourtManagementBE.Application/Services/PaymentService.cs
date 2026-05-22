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
        var page = await _unitOfWork.IPaymentRepository.FindAll(
            x => bookingIds.Contains(x.BookingID),
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
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<PaymentResponse>("Bạn không có quyền truy cập thanh toán này.");
        return Success(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Create(PaymentRequest request)
    {
        if (!await CanAccessBooking(request.BookingID)) return Unauthorized<PaymentResponse>("Bạn không có quyền tạo thanh toán cho booking này.");
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
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<PaymentResponse>("Bạn không có quyền cập nhật thanh toán này.");
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

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }
}
