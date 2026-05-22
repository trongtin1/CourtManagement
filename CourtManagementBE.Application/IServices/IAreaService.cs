using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IAreaService
{
    Task<Result<PageList<AreaResponse>>> GetAll(QueryResource query);
    Task<Result<List<AreaResponse>>> GetByFacility(int facilityId);
    Task<Result<AreaResponse>> GetById(int id);
    Task<Result<AreaResponse>> Create(AreaRequest request);
    Task<Result<AreaResponse>> Update(int id, AreaRequest request);
    Task<Result<bool>> Delete(int id);
}
