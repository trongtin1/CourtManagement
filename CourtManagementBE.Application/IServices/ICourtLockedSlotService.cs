using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtLockedSlotService
{
    Task<Result<PageList<CourtLockedSlotResponse>>> GetAll(QueryResource query);
    Task<Result<List<CourtLockedSlotResponse>>> GetByCourt(int courtId, DateTime? targetDate);
    Task<Result<List<CourtLockedSlotResponse>>> GetAvailabilityBlocks(int courtId, DateTime targetDate);
    Task<Result<CourtLockedSlotResponse>> GetById(int id);
    Task<Result<CourtLockedSlotResponse>> Create(CourtLockedSlotRequest request);
    Task<Result<CourtLockedSlotResponse>> Update(int id, CourtLockedSlotRequest request);
    Task<Result<bool>> Delete(int id);
}
