using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ITimeSlotService
{
    Task<Result<PageList<TimeSlotResponse>>> GetAll(QueryResource query);
    Task<Result<List<TimeSlotResponse>>> GetByTenant(int tenantId);
    Task<Result<TimeSlotResponse>> GetById(int id);
    Task<Result<TimeSlotResponse>> Create(CreateTimeSlotRequest request);
    Task<Result<TimeSlotResponse>> Update(int id, UpdateTimeSlotRequest request);
    Task<Result<bool>> Delete(int id);
}
