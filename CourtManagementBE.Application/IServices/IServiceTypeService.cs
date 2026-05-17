using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IServiceTypeService
{
    Task<Result<PageList<ServiceTypeResponse>>> GetAll(QueryResource query);
    Task<Result<ServiceTypeResponse>> GetById(int id);
    Task<Result<ServiceTypeResponse>> Create(CreateServiceTypeRequest req);
    Task<Result<ServiceTypeResponse>> Update(int id, UpdateServiceTypeRequest req);
    Task<Result<bool>> Delete(int id);
}
