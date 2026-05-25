
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Domain.IRepositories
{
    public interface ICourtPriceRepository : IGenericRepository<CourtPriceRule>
    {
        Task<List<CourtPriceResponse>> GetCourtPriceRulesAsync(int courtId, DateTime targetDate);
    }
}