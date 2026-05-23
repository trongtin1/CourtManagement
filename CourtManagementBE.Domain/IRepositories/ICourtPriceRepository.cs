
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Domain.IRepositories
{
    public interface ICourtPriceRepository : IGenericRepository<CourtPriceRule>
    {
        Task<List<CourtPriceRule>> GetCourtPriceRulesAsync(int courtId, DateTime targetDate);
    }
}