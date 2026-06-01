using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IBookingServiceService
{
    Task<Result<List<BookingServiceResponse>>> GetByBooking(Guid bookingId);
    Task<Result<BookingServiceResponse>> Create(BookingServiceRequest request);
    Task<Result<BookingServiceResponse>> Update(int id, UpdateBookingServiceRequest request);
    Task<Result<List<BookingServiceResponse>>> BulkUpdate(Guid bookingId, List<BookingServiceBulkUpdateItemRequest> requests);
    Task<Result<bool>> Delete(int id);
}
