using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtStatusService : BaseService, ICourtStatusService
{
    private readonly ILogger<CourtStatusService> _logger;

    public CourtStatusService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtStatusService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtStatusResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách trạng thái sân";
        var page = await _unitOfWork.ICourtStatusRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtStatus, CourtStatusResponse>(page)); }
    }

    public async Task<Result<CourtStatusResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy trạng thái sân theo ID";
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái sân.")}"); return NotFound<CourtStatusResponse>("Không tìm thấy trạng thái sân."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtStatusResponse>(entity)); }
    }

    public async Task<Result<CourtStatusResponse>> Create(CourtStatusRequest request)
    {
        const string loggingHeader = "Tạo trạng thái sân";
        var entity = _mapper.Map<CourtStatus>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtStatusResponse>(entity)); }
    }

    public async Task<Result<CourtStatusResponse>> Update(int id, CourtStatusRequest request)
    {
        const string loggingHeader = "Cập nhật trạng thái sân";
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái sân.")}"); return NotFound<CourtStatusResponse>("Không tìm thấy trạng thái sân."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICourtStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtStatusResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa trạng thái sân";
        var entity = await _unitOfWork.ICourtStatusRepository.FindFirst(x => x.StatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái sân.")}"); return NotFound<bool>("Không tìm thấy trạng thái sân."); }
        _unitOfWork.ICourtStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa trạng thái sân thành công."); }
    }
}
