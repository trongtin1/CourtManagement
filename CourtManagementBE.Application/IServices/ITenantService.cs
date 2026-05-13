using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ITenantService
{
    Task<Result<PageList<TenantResponse>>> GetAllTenants(QueryResource query);
    Task<Result<TenantResponse>> GetTenantById(int id);
    Task<Result<TenantResponse>> CreateTenant(CreateTenantRequest request);
    Task<Result<TenantResponse>> UpdateTenant(int id, UpdateTenantRequest request);
    Task<Result<bool>> DeleteTenant(int id);
}
