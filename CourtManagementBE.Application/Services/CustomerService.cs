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
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CustomerService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CustomerResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách khách hàng";
        var page = await _unitOfWork.ICustomerRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách khách hàng thành công.");
        return Success(MapPageList<Customers, CustomerResponse>(page));
    }

    public async Task<Result<List<CustomerResponse>>> SearchByPhone(string phone)
    {
        const string loggingHeader = "Tìm khách hàng theo số điện thoại";
        var list = await _unitOfWork.ICustomerRepository.FindList(x => x.Phone.Contains(phone));

        _logger.LogInformation($"{loggingHeader} - Tìm khách hàng thành công. Phone={phone}, SốLượng={list.Count}");
        return Success(_mapper.Map<List<CustomerResponse>>(list));
    }

    public async Task<Result<CustomerResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy khách hàng theo ID";
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy khách hàng. CustomerID={id}");
            return NotFound<CustomerResponse>("Không tìm thấy khách hàng.");
        }

        _logger.LogInformation($"{loggingHeader} - Lấy khách hàng thành công. CustomerID={entity.CustomerID}, CustomerName={entity.CustomerName}, Phone={entity.Phone}");
        return Success(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<CustomerResponse>> Create(CustomerRequest request)
    {
        const string loggingHeader = "Tạo khách hàng";
        var entity = _mapper.Map<Customers>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICustomerRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Tạo khách hàng thành công. CustomerID={entity.CustomerID}, CustomerName={entity.CustomerName}, Phone={entity.Phone}");
        return Created(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<CustomerResponse>> Update(int id, CustomerRequest request)
    {
        const string loggingHeader = "Cập nhật khách hàng";
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy khách hàng. CustomerID={id}");
            return NotFound<CustomerResponse>("Không tìm thấy khách hàng.");
        }

        _mapper.Map(request, entity);
        _unitOfWork.ICustomerRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Cập nhật khách hàng thành công. CustomerID={entity.CustomerID}, CustomerName={entity.CustomerName}, Phone={entity.Phone}");
        return Success(_mapper.Map<CustomerResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa khách hàng";
        var entity = await _unitOfWork.ICustomerRepository.FindFirst(x => x.CustomerID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy khách hàng. CustomerID={id}");
            return NotFound<bool>("Không tìm thấy khách hàng.");
        }

        _unitOfWork.ICustomerRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Xóa khách hàng thành công. CustomerID={id}, CustomerName={entity.CustomerName}, Phone={entity.Phone}");
        return Success(true, "Xóa khách hàng thành công.");
    }
}
