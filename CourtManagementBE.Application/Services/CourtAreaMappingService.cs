using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtAreaMappingService : BaseService, ICourtAreaMappingService
{
    private readonly ILogger<CourtAreaMappingService> _logger;

    public CourtAreaMappingService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtAreaMappingService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<List<CourtAreaMappingResponse>>> GetByCourt(int courtId)
    {
        const string loggingHeader = "Thực hiện Get By Court ánh xạ khu vực sân";
        var list = await _unitOfWork.ICourtAreaMappingRepository.FindList(x => x.CourtID == courtId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtAreaMappingResponse>>(list)); }
    }

    public async Task<Result<List<CourtAreaMappingResponse>>> GetByArea(int areaId)
    {
        const string loggingHeader = "Thực hiện Get By Area ánh xạ khu vực sân";
        var list = await _unitOfWork.ICourtAreaMappingRepository.FindList(x => x.AreaID == areaId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtAreaMappingResponse>>(list)); }
    }

    public async Task<Result<CourtAreaMappingResponse>> Create(CourtAreaMappingRequest request)
    {
        const string loggingHeader = "Tạo ánh xạ khu vực sân";
        var entity = _mapper.Map<CourtAreaMapping>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtAreaMappingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtAreaMappingResponse>(entity)); }
    }

    public async Task<Result<CourtAreaMappingResponse>> Update(int id, CourtAreaMappingRequest request)
    {
        const string loggingHeader = "Cập nhật ánh xạ khu vực sân";
        var entity = await _unitOfWork.ICourtAreaMappingRepository.FindFirst(x => x.CourtAreaMappingID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy ánh xạ sân-khu vực.")}"); return NotFound<CourtAreaMappingResponse>("Không tìm thấy ánh xạ sân-khu vực."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICourtAreaMappingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtAreaMappingResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa ánh xạ khu vực sân";
        var entity = await _unitOfWork.ICourtAreaMappingRepository.FindFirst(x => x.CourtAreaMappingID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy ánh xạ sân-khu vực.")}"); return NotFound<bool>("Không tìm thấy ánh xạ sân-khu vực."); }
        _unitOfWork.ICourtAreaMappingRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa ánh xạ thành công."); }
    }
}
