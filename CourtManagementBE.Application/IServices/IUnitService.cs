using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IUnitService
{
    Task<Result<PageList<UnitResponse>>> GetAll(QueryResource query);
    Task<Result<UnitResponse>> GetById(int id);
    Task<Result<UnitResponse>> Create(UnitRequest req);
    Task<Result<UnitResponse>> Update(int id, UnitRequest req);
    Task<Result<bool>> Delete(int id);
}
