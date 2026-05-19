using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtDefaultPriceRuleService
{
    Task<Result<PageList<CourtDefaultPriceRuleResponse>>> GetAll(QueryResource query);
    Task<Result<List<CourtDefaultPriceRuleResponse>>> GetByDay(int dayOfWeek);
    Task<Result<CourtDefaultPriceRuleResponse>> GetById(int id);
    Task<Result<CourtDefaultPriceRuleResponse>> Create(CreateCourtDefaultPriceRuleRequest request);
    Task<Result<CourtDefaultPriceRuleResponse>> Update(int id, UpdateCourtDefaultPriceRuleRequest request);
    Task<Result<bool>> Delete(int id);
}
