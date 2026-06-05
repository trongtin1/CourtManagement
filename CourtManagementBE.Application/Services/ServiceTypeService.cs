using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class ServiceTypeService : BaseService, IServiceTypeService
{
    private readonly ILogger<ServiceTypeService> _logger;

    public ServiceTypeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ServiceTypeService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<ServiceTypeResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách loại dịch vụ";
        var page = await _unitOfWork.IServiceTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<ServiceTypes, ServiceTypeResponse>(page)); }
    }

    public async Task<Result<ServiceTypeResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy loại dịch vụ theo ID";
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại dịch vụ.")}"); return NotFound<ServiceTypeResponse>("Không tìm thấy loại dịch vụ."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<ServiceTypeResponse>(entity)); }
    }

    public async Task<Result<ServiceTypeResponse>> Create(ServiceTypeRequest request)
    {
        const string loggingHeader = "Tạo loại dịch vụ";
        var entity = _mapper.Map<ServiceTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServiceTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<ServiceTypeResponse>(entity)); }
    }

    public async Task<Result<ServiceTypeResponse>> Update(int id, ServiceTypeRequest request)
    {
        const string loggingHeader = "Cập nhật loại dịch vụ";
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại dịch vụ.")}"); return NotFound<ServiceTypeResponse>("Không tìm thấy loại dịch vụ."); }
        _mapper.Map(request, entity);
        _unitOfWork.IServiceTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<ServiceTypeResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa loại dịch vụ";
        var entity = await _unitOfWork.IServiceTypeRepository.FindFirst(x => x.ServiceTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại dịch vụ.")}"); return NotFound<bool>("Không tìm thấy loại dịch vụ."); }
        _unitOfWork.IServiceTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa loại dịch vụ thành công."); }
    }
}
