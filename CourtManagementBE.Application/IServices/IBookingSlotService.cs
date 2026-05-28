using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IBookingSlotService
{
    Task<Result<List<BookingSlotResponse>>> GetByBooking(Guid bookingId);
    Task<Result<List<BookingSlotResponse>>> GetByCourtAndDate(int courtId, DateTime date);
    Task<Result<List<BookingSlotResponse>>> GetByDate(DateTime date);
    Task<Result<BookingSlotResponse>> Create(BookingSlotRequest request);
    Task<Result<bool>> Delete(int id);
}
