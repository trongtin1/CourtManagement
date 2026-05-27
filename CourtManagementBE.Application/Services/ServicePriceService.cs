using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class ServicePriceService : BaseService, IServicePriceService
{
    public ServicePriceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<ServicePriceResponse>> Create(ServicePriceRequest request)
    {
        if (!await CanAccessService(request.ServiceID)) return Unauthorized<ServicePriceResponse>("Bạn không có quyền tạo giá cho dịch vụ này.");

        var entity = _mapper.Map<ServicePrice>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServicePriceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<ServicePriceResponse>(entity));
    }

    public async Task<Result<ServicePriceResponse>> Update(int id, ServicePriceRequest request)
    {
        var entity = await _unitOfWork.IServicePriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<ServicePriceResponse>("Không tìm thấy giá dịch vụ.");
        if (!await CanAccessService(entity.ServiceID)) return Unauthorized<ServicePriceResponse>("Bạn không có quyền cập nhật giá dịch vụ này.");
        _mapper.Map(request, entity);
        _unitOfWork.IServicePriceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<ServicePriceResponse>(entity));
    }

    private async Task<bool> CanAccessService(int serviceId)
    {
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        return service is not null && (service.FacilityID is null || CanAccessFacility(service.FacilityID.Value));
    }
}
