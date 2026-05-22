using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingSlotService : BaseService, IBookingSlotService
{
    public BookingSlotService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<List<BookingSlotResponse>>> GetByBooking(Guid bookingId)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingSlotResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingSlotResponse>>(list));
    }

    public async Task<Result<BookingSlotResponse>> Create(BookingSlotRequest request)
    {
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessCourt(request.CourtID))
        {
            return Unauthorized<BookingSlotResponse>("Bạn không có quyền tạo slot cho booking hoặc sân này.");
        }

        var entity = _mapper.Map<BookingSlots>(request);
        await _unitOfWork.IBookingSlotRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingSlotResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingSlotRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy slot đặt sân.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<bool>("Bạn không có quyền xóa slot này.");
        _unitOfWork.IBookingSlotRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa slot thành công.");
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }
}
