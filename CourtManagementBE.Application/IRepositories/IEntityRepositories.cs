using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Domain.IRepositories;

public interface IBookingRepository : IGenericRepository<Bookings>
{
    Task<string?> CancelBookingAsync(
        Guid bookingId,
        string cancellationReason,
        decimal refundAmount,
        decimal penaltyAmount,
        string refundNote,
        string penaltyNote,
        string performedBy,
        string historyNote);
}

public interface IBookingServiceRepository : IGenericRepository<BookingServices>
{
    Task<string?> BulkUpdateBookingServicesAsync(Guid bookingId, string modifiedBy, List<BookingServiceBulkUpdateItemRequest> requests);
}

public interface IBookingComboRepository : IGenericRepository<BookingCombos>
{
    Task<string?> BulkUpdateBookingCombosAsync(Guid bookingId, string modifiedBy, List<BookingComboBulkUpdateItemRequest> requests);
}
