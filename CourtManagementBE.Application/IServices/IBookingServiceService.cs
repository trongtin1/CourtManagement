using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IBookingServiceService
{
    Task<Result<List<BookingServiceResponse>>> GetByBooking(Guid bookingId);
    Task<Result<BookingServiceResponse>> Create(BookingServiceRequest request);
    Task<Result<BookingServiceResponse>> Update(int id, BookingServiceRequest request);
    Task<Result<bool>> Delete(int id);
}
