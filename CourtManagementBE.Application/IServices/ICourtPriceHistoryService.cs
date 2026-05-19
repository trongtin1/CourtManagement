using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Application.IServices;

public interface ICourtPriceHistoryService
{
    Task<Result<List<CourtPriceHistoryResponse>>> GetByCourt(int courtId);
    Task<Result<List<CourtPriceHistoryResponse>>> GetByPriceRule(int courtPriceRuleId);
}
