using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtFeatureCategoryService
{
    Task<Result<PageList<CourtFeatureCategoryResponse>>> GetAll(QueryResource query);
    Task<Result<CourtFeatureCategoryResponse>> GetById(int id);
    Task<Result<CourtFeatureCategoryResponse>> Create(CreateCourtFeatureCategoryRequest req);
    Task<Result<CourtFeatureCategoryResponse>> Update(int id, UpdateCourtFeatureCategoryRequest req);
    Task<Result<bool>> Delete(int id);
}
