using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class TenantService : BaseService, ITenantService
{
    public TenantService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper)
    {
    }

    public async Task<Result<PageList<TenantResponse>>> GetAllTenants(QueryResource query)
    {
        var tenants = await _unitOfWork.ITenantRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        var response = MapPageList<Tenant, TenantResponse>(tenants);

        return Success(response);
    }

    public async Task<Result<TenantResponse>> GetTenantById(int id)
    {
        var tenant = await _unitOfWork.ITenantRepository.FindFirst(t => t.TenantID == id);
        if (tenant is null)
            return NotFound<TenantResponse>($"Không tìm thấy Tenant với ID {id}");

        var response = _mapper.Map<TenantResponse>(tenant);

        return Success(response);
    }

    public async Task<Result<TenantResponse>> CreateTenant(CreateTenantRequest request)
    {
        var existingTenant = await _unitOfWork.ITenantRepository.FindFirst(t => t.Domain == request.Domain && !string.IsNullOrEmpty(request.Domain));
        if (existingTenant is not null)
            return Conflict<TenantResponse>("Domain này đã được sử dụng.");

        var tenant = _mapper.Map<Tenant>(request);
        tenant.CreatedDate = DateTime.UtcNow;

        await _unitOfWork.ITenantRepository.Add(tenant);
        await _unitOfWork.SaveChangesAsync();

        var response = _mapper.Map<TenantResponse>(tenant);

        return Created(response);
    }

    public async Task<Result<TenantResponse>> UpdateTenant(int id, UpdateTenantRequest request)
    {
        var tenant = await _unitOfWork.ITenantRepository.FindFirst(t => t.TenantID == id);
        if (tenant is null)
            return NotFound<TenantResponse>($"Không tìm thấy Tenant với ID {id}");

        if (!string.IsNullOrEmpty(request.Domain) && request.Domain != tenant.Domain)
        {
            var domainExists = await _unitOfWork.ITenantRepository.FindFirst(t => t.Domain == request.Domain);
            if (domainExists is not null)
                return Conflict<TenantResponse>("Domain này đã được sử dụng bởi Tenant khác.");
        }

        _mapper.Map(request, tenant);

        _unitOfWork.ITenantRepository.Update(tenant);
        await _unitOfWork.SaveChangesAsync();

        var response = _mapper.Map<TenantResponse>(tenant);

        return Success(response);
    }

    public async Task<Result<bool>> DeleteTenant(int id)
    {
        var tenant = await _unitOfWork.ITenantRepository.FindFirst(t => t.TenantID == id);
        if (tenant is null)
            return NotFound<bool>($"Không tìm thấy Tenant với ID {id}");

        // TODO: Cân nhắc việc xóa mềm (soft delete) thay vì xóa cứng (hard delete) 
        // hoặc kiểm tra xem Tenant có dữ liệu liên quan không trước khi xóa.

        _unitOfWork.ITenantRepository.Remove(tenant);
        await _unitOfWork.SaveChangesAsync();

        return Success(true, "Xóa Tenant thành công.");
    }
}
