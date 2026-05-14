using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICustomerService
{
    Task<Result<PageList<CustomerResponse>>> GetAll(QueryResource query);
    Task<Result<List<CustomerResponse>>> SearchByPhone(string phone);
    Task<Result<CustomerResponse>> GetById(int id);
    Task<Result<CustomerResponse>> Create(CreateCustomerRequest request);
    Task<Result<CustomerResponse>> Update(int id, UpdateCustomerRequest request);
    Task<Result<bool>> Delete(int id);
}
