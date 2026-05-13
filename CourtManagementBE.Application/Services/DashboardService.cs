using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;

namespace CourtManagementBE.Application.Services;

public class DashboardService : BaseService, IDashboardService
{
    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
    }

    public async Task<Result<DashboardSummaryResponse>> GetSummary()
    {
        var today = DateTime.UtcNow.Date;

        var activeBookings = await _unitOfWork.IBookingRepository.Count(x => x.Status != "cancelled");
        var bookingsToday = await _unitOfWork.IBookingRepository.Count(x => x.BookingDate.Date == today);
        var registeredUsers = await _unitOfWork.IAuthRepository.Count(_ => true);

        var summary = new DashboardSummaryResponse
        {
            Metrics =
            [
                new DashboardMetricResponse
                {
                    Key = "active-bookings",
                    Title = "Active bookings",
                    Value = activeBookings,
                    IconKey = "file-text"
                },
                new DashboardMetricResponse
                {
                    Key = "bookings-today",
                    Title = "Bookings today",
                    Value = bookingsToday,
                    IconKey = "calendar"
                },
                new DashboardMetricResponse
                {
                    Key = "registered-users",
                    Title = "Registered users",
                    Value = registeredUsers,
                    IconKey = "team"
                }
            ],
            Overview = "Dashboard data is loaded from booking and user records in the backend."
        };

        return Success(summary);
    }
}
