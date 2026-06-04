using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Domain.IRepositories;

public interface IBookingGroupRepository : IGenericRepository<BookingGroups>
{
    Task<string?> CreateRecurringBookingGroupAsync(
        int customerId, int facilityId, int courtId, DateTime startDate, DateTime endDate,
        TimeSpan startTime, TimeSpan endTime, string daysOfWeek, string createdBy, string note,
        decimal? flatRatePrice = null);

    Task<string?> UpdateRecurringBookingGroupAsync(
        int bookingGroupId, int customerId, int facilityId, int courtId, DateTime startDate, DateTime endDate,
        TimeSpan startTime, TimeSpan endTime, string daysOfWeek, string modifiedBy, string note,
        decimal? flatRatePrice = null);
}
