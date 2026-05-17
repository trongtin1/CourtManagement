using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingServiceService : BaseService, IBookingServiceService
{
    public BookingServiceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<List<BookingServiceResponse>>> GetByBooking(Guid bookingId)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingServiceResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingServiceResponse>>(list));
    }

    public async Task<Result<BookingServiceResponse>> Create(CreateBookingServiceRequest request)
    {
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessService(request.ServiceID))
        {
            return Unauthorized<BookingServiceResponse>("Bạn không có quyền thêm dịch vụ này vào booking.");
        }

        var entity = _mapper.Map<BookingServices>(request);
        entity.TotalAmount = request.UnitPrice * request.Quantity - request.DiscountAmount;
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<BookingServiceResponse>> Update(int id, UpdateBookingServiceRequest request)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<BookingServiceResponse>("Không tìm thấy dịch vụ booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<BookingServiceResponse>("Bạn không có quyền cập nhật dịch vụ booking này.");
        _mapper.Map(request, entity);
        entity.TotalAmount = entity.UnitPrice * request.Quantity - request.DiscountAmount;
        _unitOfWork.IBookingServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<bool>("Bạn không có quyền xóa dịch vụ booking này.");
        _unitOfWork.IBookingServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa dịch vụ booking thành công.");
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }

    private async Task<bool> CanAccessService(int serviceId)
    {
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        return service is not null && (service.FacilityID is null || CanAccessFacility(service.FacilityID.Value));
    }
}
