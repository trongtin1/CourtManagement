using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class ServicePriceService : BaseService, IServicePriceService
{
    public ServicePriceService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<ServicePriceResponse>>> GetByService(int serviceId)
    {
        var list = await _unitOfWork.IServicePriceRepository.FindList(x => x.ServiceID == serviceId);
        return Success(_mapper.Map<List<ServicePriceResponse>>(list));
    }

    public async Task<Result<ServicePriceResponse>> GetCurrentPrice(int serviceId)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = await _unitOfWork.IServicePriceRepository.FindFirst(
            x => x.ServiceID == serviceId && x.EffectiveDate <= now && (x.ExpiryDate == null || x.ExpiryDate > now));
        if (entity is null) return NotFound<ServicePriceResponse>("Không tìm thấy giá hiện hành.");
        return Success(_mapper.Map<ServicePriceResponse>(entity));
    }

    public async Task<Result<ServicePriceResponse>> Create(CreateServicePriceRequest request)
    {
        var entity = _mapper.Map<ServicePrice>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServicePriceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<ServicePriceResponse>(entity));
    }

    public async Task<Result<ServicePriceResponse>> Update(int id, UpdateServicePriceRequest request)
    {
        var entity = await _unitOfWork.IServicePriceRepository.FindFirst(x => x.ID == id);
        if (entity is null) return NotFound<ServicePriceResponse>("Không tìm thấy giá dịch vụ.");
        _mapper.Map(request, entity);
        _unitOfWork.IServicePriceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<ServicePriceResponse>(entity));
    }
}
