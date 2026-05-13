using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingSlotService : BaseService, IBookingSlotService
{
    public BookingSlotService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<BookingSlotResponse>>> GetByBooking(Guid bookingId)
    {
        var list = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingSlotResponse>>(list));
    }

    public async Task<Result<BookingSlotResponse>> Create(CreateBookingSlotRequest request)
    {
        var entity = _mapper.Map<BookingSlots>(request);
        await _unitOfWork.IBookingSlotRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingSlotResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingSlotRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy slot đặt sân.");
        _unitOfWork.IBookingSlotRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa slot thành công.");
    }
}
