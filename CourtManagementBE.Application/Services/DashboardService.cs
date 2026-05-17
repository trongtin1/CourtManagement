using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;

namespace CourtManagementBE.Application.Services;

public class DashboardService : BaseService, IDashboardService
{
    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser)
    {
    }

    public async Task<Result<DashboardSummaryResponse>> GetSummary()
    {
        var today = DateTime.UtcNow.Date;
        var courtIds = await GetScopedCourtIds();

        var activeBookings = await _unitOfWork.IBookingRepository.Count(
            x => x.Status != "cancelled" && courtIds.Contains(x.CourtID));
        var bookingsToday = await _unitOfWork.IBookingRepository.Count(
            x => x.BookingDate.Date == today && courtIds.Contains(x.CourtID));
        var registeredUsers = _currentUser?.IsSuperAdmin == true
            ? await _unitOfWork.IAuthRepository.Count(_ => true)
            : await _unitOfWork.IAuthRepository.Count(x => x.FacilityID == WorkingFacilityId);

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
            Overview = WorkingFacilityId is null
                ? "Dashboard data is loaded across all facilities."
                : "Dashboard data is scoped to the selected facility."
        };

        return Success(summary);
    }
}
