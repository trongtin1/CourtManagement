using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IComboService
{
    Task<Result<PageList<ComboResponse>>> GetAll(QueryResource query);
    Task<Result<ComboResponse>> GetById(int id);
    Task<Result<ComboResponse>> Create(ComboRequest request);
    Task<Result<ComboResponse>> Update(int id, ComboRequest request);
    Task<Result<bool>> Delete(int id);
    Task<Result<bool>> ToggleActive(int id);
}