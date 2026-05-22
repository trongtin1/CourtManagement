using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IPriceRuleTypeService
{
    Task<Result<PageList<PriceRuleTypeResponse>>> GetAll(QueryResource query);
    Task<Result<PriceRuleTypeResponse>> GetById(int id);
    Task<Result<PriceRuleTypeResponse>> Create(PriceRuleTypeRequest req);
    Task<Result<PriceRuleTypeResponse>> Update(int id, PriceRuleTypeRequest req);
    Task<Result<bool>> Delete(int id);
}
