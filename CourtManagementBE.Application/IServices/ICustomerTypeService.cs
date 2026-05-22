using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICustomerTypeService
{
    Task<Result<PageList<CustomerTypeResponse>>> GetAll(QueryResource query);
    Task<Result<CustomerTypeResponse>> GetById(int id);
    Task<Result<CustomerTypeResponse>> Create(CustomerTypeRequest req);
    Task<Result<CustomerTypeResponse>> Update(int id, CustomerTypeRequest req);
    Task<Result<bool>> Delete(int id);
}
