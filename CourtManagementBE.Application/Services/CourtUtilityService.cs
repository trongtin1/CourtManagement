using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtUtilityService : BaseService, ICourtUtilityService
{
    private readonly ILogger<CourtUtilityService> _logger;

    public CourtUtilityService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtUtilityService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<List<CourtUtilityResponse>>> GetByCourt(int courtId)
    {
        const string loggingHeader = "Thực hiện Get By Court tiện ích sân";
        var list = await _unitOfWork.ICourtUtilityRepository.FindList(x => x.CourtID == courtId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtUtilityResponse>>(list)); }
    }

    public async Task<Result<CourtUtilityResponse>> Create(CourtUtilityRequest request)
    {
        const string loggingHeader = "Tạo tiện ích sân";
        var existing = await _unitOfWork.ICourtUtilityRepository.FindFirst(
            x => x.CourtID == request.CourtID && x.UtilityID == request.UtilityID);
        if (existing is not null) { _logger.LogWarning($"{loggingHeader} - {("Tiện ích đã được gán cho sân này.")}"); return BadRequest<CourtUtilityResponse>("Tiện ích đã được gán cho sân này."); }

        var entity = _mapper.Map<CourtUtilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtUtilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtUtilityResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa tiện ích sân";
        var entity = await _unitOfWork.ICourtUtilityRepository.FindFirst(x => x.CourtUtilitiesID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tiện ích sân.")}"); return NotFound<bool>("Không tìm thấy tiện ích sân."); }
        _unitOfWork.ICourtUtilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Gỡ tiện ích khỏi sân thành công."); }
    }
}
