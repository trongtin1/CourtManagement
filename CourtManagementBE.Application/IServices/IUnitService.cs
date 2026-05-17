using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IUnitService
{
    Task<Result<PageList<UnitResponse>>> GetAll(QueryResource query);
    Task<Result<UnitResponse>> GetById(int id);
    Task<Result<UnitResponse>> Create(CreateUnitRequest req);
    Task<Result<UnitResponse>> Update(int id, UpdateUnitRequest req);
    Task<Result<bool>> Delete(int id);
}
