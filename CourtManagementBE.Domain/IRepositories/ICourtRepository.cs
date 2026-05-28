
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Domain.IRepositories
{
    public interface ICourtRepository : IGenericRepository<Courts>
    {
        Task<List<CourtSlotAvailabilityResponse>> GetSlotAvailabilityAsync(int courtId, DateTime targetDate);
        Task<List<CourtTimelineAvailabilityResponse>> GetTimelineAvailabilityAsync(int facilityId, DateTime targetDate);
    }
}