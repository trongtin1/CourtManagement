using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface ICourtFeatureService
{
    Task<Result<PageList<CourtFeatureResponse>>> GetAll(QueryResource query);
    Task<Result<CourtFeatureResponse>> GetById(int id);
    Task<Result<CourtFeatureResponse>> Create(CreateCourtFeatureRequest request);
    Task<Result<CourtFeatureResponse>> Update(int id, UpdateCourtFeatureRequest request);
    Task<Result<bool>> Delete(int id);
}
