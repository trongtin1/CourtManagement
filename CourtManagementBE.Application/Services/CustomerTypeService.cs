using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CustomerTypeService : BaseService, ICustomerTypeService
{
    private readonly ILogger<CustomerTypeService> _logger;

    public CustomerTypeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CustomerTypeService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CustomerTypeResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách loại khách hàng";
        var page = await _unitOfWork.ICustomerTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CustomerTypes, CustomerTypeResponse>(page)); }
    }

    public async Task<Result<CustomerTypeResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy loại khách hàng theo ID";
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khách hàng.")}"); return NotFound<CustomerTypeResponse>("Không tìm thấy loại khách hàng."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CustomerTypeResponse>(entity)); }
    }

    public async Task<Result<CustomerTypeResponse>> Create(CustomerTypeRequest request)
    {
        const string loggingHeader = "Tạo loại khách hàng";
        var entity = _mapper.Map<CustomerTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICustomerTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CustomerTypeResponse>(entity)); }
    }

    public async Task<Result<CustomerTypeResponse>> Update(int id, CustomerTypeRequest request)
    {
        const string loggingHeader = "Cập nhật loại khách hàng";
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khách hàng.")}"); return NotFound<CustomerTypeResponse>("Không tìm thấy loại khách hàng."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICustomerTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CustomerTypeResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa loại khách hàng";
        var entity = await _unitOfWork.ICustomerTypeRepository.FindFirst(x => x.CustomerTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khách hàng.")}"); return NotFound<bool>("Không tìm thấy loại khách hàng."); }
        _unitOfWork.ICustomerTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa loại khách hàng thành công."); }
    }
}
