using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtTypeService
{
    Task<Result<PageList<CourtTypeResponse>>> GetAll(QueryResource query);
    Task<Result<CourtTypeResponse>> GetById(int id);
    Task<Result<CourtTypeResponse>> Create(CourtTypeRequest request);
    Task<Result<CourtTypeResponse>> Update(int id, CourtTypeRequest request);
    Task<Result<bool>> Delete(int id);
}
