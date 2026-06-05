using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtFeatureCategoryService : BaseService, ICourtFeatureCategoryService
{
    private readonly ILogger<CourtFeatureCategoryService> _logger;

    public CourtFeatureCategoryService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtFeatureCategoryService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtFeatureCategoryResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách danh mục đặc trưng sân";
        var page = await _unitOfWork.ICourtFeatureCategoryRepository.FindAll(
            _ => true,
            include: q => q.Include(x => x.CourtFeatures),
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtFeatureCategories, CourtFeatureCategoryResponse>(page)); }
    }

    public async Task<Result<CourtFeatureCategoryResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy danh mục đặc trưng sân theo ID";
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(
            x => x.CourtFeatureCategoryID == id,
            include: q => q.Include(x => x.CourtFeatures));
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại tiện ích.")}"); return NotFound<CourtFeatureCategoryResponse>("Không tìm thấy loại tiện ích."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtFeatureCategoryResponse>(entity)); }
    }

    public async Task<Result<CourtFeatureCategoryResponse>> Create(CourtFeatureCategoryRequest request)
    {
        const string loggingHeader = "Tạo danh mục đặc trưng sân";
        var entity = _mapper.Map<CourtFeatureCategories>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureCategoryRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtFeatureCategoryResponse>(entity)); }
    }

    public async Task<Result<CourtFeatureCategoryResponse>> Update(int id, CourtFeatureCategoryRequest request)
    {
        const string loggingHeader = "Cập nhật danh mục đặc trưng sân";
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(x => x.CourtFeatureCategoryID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại tiện ích.")}"); return NotFound<CourtFeatureCategoryResponse>("Không tìm thấy loại tiện ích."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICourtFeatureCategoryRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtFeatureCategoryResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa danh mục đặc trưng sân";
        var entity = await _unitOfWork.ICourtFeatureCategoryRepository.FindFirst(x => x.CourtFeatureCategoryID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại tiện ích.")}"); return NotFound<bool>("Không tìm thấy loại tiện ích."); }
        _unitOfWork.ICourtFeatureCategoryRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa loại tiện ích thành công."); }
    }
}
