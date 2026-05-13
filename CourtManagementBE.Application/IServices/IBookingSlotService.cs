using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IBookingSlotService
{
    Task<Result<List<BookingSlotResponse>>> GetByBooking(Guid bookingId);
    Task<Result<BookingSlotResponse>> Create(CreateBookingSlotRequest request);
    Task<Result<bool>> Delete(int id);
}
