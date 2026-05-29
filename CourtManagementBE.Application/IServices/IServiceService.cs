using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IServiceService
{
    Task<Result<PageList<ServiceResponse>>> GetAll(QueryResource query);
    Task<Result<ServiceResponse>> GetById(int id);
    Task<Result<ServiceResponse>> Create(ServiceRequest request);
    Task<Result<ServiceResponse>> Update(int id, ServiceRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<bool>> ToggleActive(int id);
    Task<Result<ServiceResponse>> DeductStock(int id, int quantity);
    Task<Result<ServiceResponse>> HandoutRental(int id, int quantity);
    Task<Result<ServiceResponse>> ReturnRental(int id, int quantity);
}
