using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface IServicePriceService
{
    Task<Result<List<ServicePriceResponse>>> GetByService(int serviceId);
    Task<Result<ServicePriceResponse>> GetCurrentPrice(int serviceId);
    Task<Result<ServicePriceResponse>> Create(ServicePriceRequest request);
    Task<Result<ServicePriceResponse>> Update(int id, ServicePriceRequest request);
}
