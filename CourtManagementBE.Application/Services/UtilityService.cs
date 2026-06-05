using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class UtilityService : BaseService, IUtilityService
{
    private readonly ILogger<UtilityService> _logger;

    public UtilityService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UtilityService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<UtilityResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách tiện ích";
        var page = await _unitOfWork.IUtilityRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<Utilities, UtilityResponse>(page)); }
    }

    public async Task<Result<UtilityResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy tiện ích theo ID";
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tiện ích.")}"); return NotFound<UtilityResponse>("Không tìm thấy tiện ích."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UtilityResponse>(entity)); }
    }

    public async Task<Result<UtilityResponse>> Create(UtilityRequest request)
    {
        const string loggingHeader = "Tạo tiện ích";
        var entity = _mapper.Map<Utilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IUtilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<UtilityResponse>(entity)); }
    }

    public async Task<Result<UtilityResponse>> Update(int id, UtilityRequest request)
    {
        const string loggingHeader = "Cập nhật tiện ích";
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tiện ích.")}"); return NotFound<UtilityResponse>("Không tìm thấy tiện ích."); }
        _mapper.Map(request, entity);
        _unitOfWork.IUtilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UtilityResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa tiện ích";
        var entity = await _unitOfWork.IUtilityRepository.FindFirst(x => x.UtilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy tiện ích.")}"); return NotFound<bool>("Không tìm thấy tiện ích."); }
        _unitOfWork.IUtilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa tiện ích thành công."); }
    }
}
