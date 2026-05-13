using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IDashboardService
{
    Task<Result<DashboardSummaryResponse>> GetSummary();
}
