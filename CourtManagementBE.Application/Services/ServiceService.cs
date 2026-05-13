using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class ServiceService : BaseService, IServiceService
{
    public ServiceService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<ServiceResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IServiceRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Domain.Entities.Services, ServiceResponse>(page));
    }

    public async Task<Result<List<ServiceResponse>>> GetByTenant(int tenantId)
    {
        var list = await _unitOfWork.IServiceRepository.FindList(x => x.TenantID == tenantId);
        return Success(_mapper.Map<List<ServiceResponse>>(list));
    }

    public async Task<Result<ServiceResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        return Success(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<ServiceResponse>> Create(CreateServiceRequest request)
    {
        var entity = _mapper.Map<Domain.Entities.Services>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<ServiceResponse>> Update(int id, UpdateServiceRequest request)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ.");
        _unitOfWork.IServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa dịch vụ thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ.");
        entity.IsActive = !entity.IsActive;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, entity.IsActive ? "Kích hoạt thành công." : "Vô hiệu hóa thành công.");
    }
}
