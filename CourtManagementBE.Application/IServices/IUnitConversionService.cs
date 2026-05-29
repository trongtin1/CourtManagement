using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IUnitConversionService
{
    Task<Result<List<UnitConversionResponse>>> GetByService(int serviceId);
    Task<Result<UnitConversionResponse>> GetById(int id);
    Task<Result<UnitConversionResponse>> Create(UnitConversionRequest request);
    Task<Result<UnitConversionResponse>> Update(int id, UnitConversionRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<decimal>> ConvertQuantity(int serviceId, int fromUnitId, int toUnitId, decimal quantity);
}
