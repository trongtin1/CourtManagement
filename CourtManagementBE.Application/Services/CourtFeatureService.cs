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

public class CourtFeatureService : BaseService, ICourtFeatureService
{
    private readonly ILogger<CourtFeatureService> _logger;

    public CourtFeatureService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtFeatureService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtFeatureResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách đặc trưng sân";
        var page = await _unitOfWork.ICourtFeatureRepository.FindAll(
            _ => true,
            include: q => q.Include(x => x.CourtFeatureCategory!),
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtFeatures, CourtFeatureResponse>(page)); }
    }

    public async Task<Result<CourtFeatureResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy đặc trưng sân theo ID";
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == id,
            include: q => q.Include(x => x.CourtFeatureCategory!));
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay dac diem san.")}"); return NotFound<CourtFeatureResponse>("Khong tim thay dac diem san."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtFeatureResponse>(entity)); }
    }

    public async Task<Result<CourtFeatureResponse>> Create(CourtFeatureRequest request)
    {
        const string loggingHeader = "Tạo đặc trưng sân";
        var entity = _mapper.Map<CourtFeatures>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        var saved = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == entity.CourtFeatureID,
            include: q => q.Include(x => x.CourtFeatureCategory!));

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtFeatureResponse>(saved ?? entity)); }
    }

    public async Task<Result<CourtFeatureResponse>> Update(int id, CourtFeatureRequest request)
    {
        const string loggingHeader = "Cập nhật đặc trưng sân";
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay dac diem san.")}"); return NotFound<CourtFeatureResponse>("Khong tim thay dac diem san."); }

        _mapper.Map(request, entity);
        _unitOfWork.ICourtFeatureRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        var saved = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == id,
            include: q => q.Include(x => x.CourtFeatureCategory!));

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtFeatureResponse>(saved ?? entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa đặc trưng sân";
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay dac diem san.")}"); return NotFound<bool>("Khong tim thay dac diem san."); }
        _unitOfWork.ICourtFeatureRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xoa dac diem san thanh cong."); }
    }

}
