using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class CourtFeatureCategoryService : BaseService, ICourtFeatureCategoryService
{
    public CourtFeatureCategoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtFeatureCategoryResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtFeatureCategoryRepository.FindAll(
            _ => true,
            include: q => q.Include(x => x.CourtFeatures),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtFeatureCategories, CourtFeatureCategoryResponse>(page));
    }

    public async Task<Result<CourtFeatureCategoryResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(
            x => x.CourtFeatureCategoryID == id,
            include: q => q.Include(x => x.CourtFeatures));
        if (entity is null) return NotFound<CourtFeatureCategoryResponse>("Không tìm thấy loại tiện ích.");
        return Success(_mapper.Map<CourtFeatureCategoryResponse>(entity));
    }

    public async Task<Result<CourtFeatureCategoryResponse>> Create(CourtFeatureCategoryRequest request)
    {
        var entity = _mapper.Map<CourtFeatureCategories>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureCategoryRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtFeatureCategoryResponse>(entity));
    }

    public async Task<Result<CourtFeatureCategoryResponse>> Update(int id, CourtFeatureCategoryRequest request)
    {
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(x => x.CourtFeatureCategoryID == id);
        if (entity is null) return NotFound<CourtFeatureCategoryResponse>("Không tìm thấy loại tiện ích.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtFeatureCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtFeatureCategoryResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(x => x.CourtFeatureCategoryID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy loại tiện ích.");
        _unitOfWork.ICourtFeatureCategoryRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa loại tiện ích thành công.");
    }
}
