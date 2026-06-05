using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Constants;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class DashboardService : BaseService, IDashboardService
{
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<DashboardService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<DashboardSummaryResponse>> GetSummary()
    {
        const string loggingHeader = "Thực hiện Get Summary bảng điều khiển";
        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
        var courtIds = await GetScopedCourtIds();

        var activeBookings = await _unitOfWork.IBookingRepository.Count(
            x => x.Status != BookingStatusConstants.Cancelled && courtIds.Contains(x.CourtID));
        var bookingsToday = await _unitOfWork.IBookingRepository.Count(
            x => x.BookingDate == today && courtIds.Contains(x.CourtID));
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

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(summary); }
    }
}
