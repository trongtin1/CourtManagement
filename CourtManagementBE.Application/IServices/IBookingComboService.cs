using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IBookingComboService
{
    Task<Result<List<BookingComboResponse>>> GetByBooking(Guid bookingId);
    Task<Result<BookingComboResponse>> Create(BookingComboRequest request);
    Task<Result<BookingComboResponse>> Update(int id, UpdateBookingComboRequest request);
    Task<Result<List<BookingComboResponse>>> BulkUpdate(Guid bookingId, List<BookingComboBulkUpdateItemRequest> requests);
    Task<Result<bool>> Delete(int id);
}
