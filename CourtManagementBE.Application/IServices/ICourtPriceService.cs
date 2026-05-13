using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtPriceService
{
    Task<Result<PageList<CourtPriceResponse>>> GetAll(QueryResource query);
    Task<Result<List<CourtPriceResponse>>> GetByCourt(int courtId);
    Task<Result<List<CourtPriceResponse>>> GetByCourtAndDay(int courtId, int dayOfWeek);
    Task<Result<CourtPriceResponse>> GetById(int id);
    Task<Result<CourtPriceResponse>> Create(CreateCourtPriceRequest request);
    Task<Result<CourtPriceResponse>> Update(int id, UpdateCourtPriceRequest request);
    Task<Result<bool>> Delete(int id);
}
