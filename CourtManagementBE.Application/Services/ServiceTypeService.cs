using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class ServiceTypeService : BaseService, IServiceTypeService
{
    public ServiceTypeService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<ServiceTypeResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IServiceTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<ServiceTypes, ServiceTypeResponse>(page));
    }

    public async Task<Result<ServiceTypeResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) return NotFound<ServiceTypeResponse>("Không tìm thấy loại dịch vụ.");
        return Success(_mapper.Map<ServiceTypeResponse>(entity));
    }

    public async Task<Result<ServiceTypeResponse>> Create(ServiceTypeRequest request)
    {
        var entity = _mapper.Map<ServiceTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServiceTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<ServiceTypeResponse>(entity));
    }

    public async Task<Result<ServiceTypeResponse>> Update(int id, ServiceTypeRequest request)
    {
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) return NotFound<ServiceTypeResponse>("Không tìm thấy loại dịch vụ.");
        _mapper.Map(request, entity);
        _unitOfWork.IServiceTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<ServiceTypeResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy loại dịch vụ.");
        _unitOfWork.IServiceTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa loại dịch vụ thành công.");
    }
}
