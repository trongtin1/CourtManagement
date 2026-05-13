using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IServiceService
{
    Task<Result<PageList<ServiceResponse>>> GetAll(QueryResource query);
    Task<Result<List<ServiceResponse>>> GetByTenant(int tenantId);
    Task<Result<ServiceResponse>> GetById(int id);
    Task<Result<ServiceResponse>> Create(CreateServiceRequest request);
    Task<Result<ServiceResponse>> Update(int id, UpdateServiceRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<bool>> ToggleActive(int id);
}
