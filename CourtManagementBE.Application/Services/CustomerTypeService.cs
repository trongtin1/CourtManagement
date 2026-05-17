using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CustomerTypeService : BaseService, ICustomerTypeService
{
    public CustomerTypeService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CustomerTypeResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICustomerTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CustomerTypes, CustomerTypeResponse>(page));
    }

    public async Task<Result<CustomerTypeResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) return NotFound<CustomerTypeResponse>("Không tìm thấy loại khách hàng.");
        return Success(_mapper.Map<CustomerTypeResponse>(entity));
    }

    public async Task<Result<CustomerTypeResponse>> Create(CreateCustomerTypeRequest request)
    {
        var entity = _mapper.Map<CustomerTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICustomerTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CustomerTypeResponse>(entity));
    }

    public async Task<Result<CustomerTypeResponse>> Update(int id, UpdateCustomerTypeRequest request)
    {
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) return NotFound<CustomerTypeResponse>("Không tìm thấy loại khách hàng.");
        _mapper.Map(request, entity);
        _unitOfWork.ICustomerTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CustomerTypeResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy loại khách hàng.");
        _unitOfWork.ICustomerTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa loại khách hàng thành công.");
    }
}
