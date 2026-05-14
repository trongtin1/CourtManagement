using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CustomerService : BaseService, ICustomerService
{
    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CustomerResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICustomerRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Customers, CustomerResponse>(page));
    }

    public async Task<Result<List<CustomerResponse>>> SearchByPhone(string phone)
    {
        var list = await _unitOfWork.ICustomerRepository.FindList(x => x.Phone.Contains(phone));
        return Success(_mapper.Map<List<CustomerResponse>>(list));
    }

    public async Task<Result<CustomerResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null) return NotFound<CustomerResponse>("Không tìm thấy khách hàng.");
        return Success(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<CustomerResponse>> Create(CreateCustomerRequest request)
    {
        var entity = _mapper.Map<Customers>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICustomerRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<CustomerResponse>> Update(int id, UpdateCustomerRequest request)
    {
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null) return NotFound<CustomerResponse>("Không tìm thấy khách hàng.");
        _mapper.Map(request, entity);
        _unitOfWork.ICustomerRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy khách hàng.");
        _unitOfWork.ICustomerRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa khách hàng thành công.");
    }
}
