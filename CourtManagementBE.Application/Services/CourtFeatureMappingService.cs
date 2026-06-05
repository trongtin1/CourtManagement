using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtFeatureMappingService : BaseService, ICourtFeatureMappingService
{
    private readonly ILogger<CourtFeatureMappingService> _logger;

    public CourtFeatureMappingService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtFeatureMappingService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<List<CourtFeatureMappingResponse>>> GetByCourt(int courtId)
    {
        const string loggingHeader = "Thực hiện Get By Court ánh xạ đặc trưng sân";
        var list = await _unitOfWork.ICourtFeatureMappingRepository.FindList(x => x.CourtID == courtId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtFeatureMappingResponse>>(list)); }
    }

    public async Task<Result<CourtFeatureMappingResponse>> Create(int courtId, CourtFeatureMappingRequest request)
    {
        const string loggingHeader = "Tạo ánh xạ đặc trưng sân";
        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == courtId);
        if (court is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay san.")}"); return NotFound<CourtFeatureMappingResponse>("Khong tim thay san."); }

        var feature = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == request.CourtFeatureID);
        if (feature is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay dac tinh san.")}"); return NotFound<CourtFeatureMappingResponse>("Khong tim thay dac tinh san."); }

        var existing = await _unitOfWork.ICourtFeatureMappingRepository.FindFirst(
            x => x.CourtID == courtId && x.CourtFeatureID == request.CourtFeatureID);
        if (existing is not null) { _logger.LogWarning($"{loggingHeader} - {("Dac tinh da duoc gan cho san nay.")}"); return BadRequest<CourtFeatureMappingResponse>("Dac tinh da duoc gan cho san nay."); }

        var entity = _mapper.Map<CourtFeatureMappings>(request);
        entity.CourtID = courtId;
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureMappingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtFeatureMappingResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int courtId, int featureId)
    {
        const string loggingHeader = "Xóa ánh xạ đặc trưng sân";
        var entity = await _unitOfWork.ICourtFeatureMappingRepository.FindFirst(x => x.CourtID == courtId && x.CourtFeatureID == featureId);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Khong tim thay dac tinh san da gan.")}"); return NotFound<bool>("Khong tim thay dac tinh san da gan."); }
        _unitOfWork.ICourtFeatureMappingRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Go dac tinh khoi san thanh cong."); }
    }
}
