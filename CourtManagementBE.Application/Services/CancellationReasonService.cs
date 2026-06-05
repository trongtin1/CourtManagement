using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CancellationReasonService : BaseService, ICancellationReasonService
{
    private readonly ILogger<CancellationReasonService> _logger;

    public CancellationReasonService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CancellationReasonService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CancellationReasonResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách lý do hủy";
        var page = await _unitOfWork.ICancellationReasonRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CancellationReasons, CancellationReasonResponse>(page)); }
    }

    public async Task<Result<CancellationReasonResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy lý do hủy theo ID";
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hủy.")}"); return NotFound<CancellationReasonResponse>("Không tìm thấy lý do hủy."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CancellationReasonResponse>(entity)); }
    }

    public async Task<Result<CancellationReasonResponse>> Create(CancellationReasonRequest request)
    {
        const string loggingHeader = "Tạo lý do hủy";
        var entity = _mapper.Map<CancellationReasons>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICancellationReasonRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CancellationReasonResponse>(entity)); }
    }

    public async Task<Result<CancellationReasonResponse>> Update(int id, CancellationReasonRequest request)
    {
        const string loggingHeader = "Cập nhật lý do hủy";
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hủy.")}"); return NotFound<CancellationReasonResponse>("Không tìm thấy lý do hủy."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICancellationReasonRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CancellationReasonResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa lý do hủy";
        var entity = await _unitOfWork.ICancellationReasonRepository.FindFirst(x => x.CancellationReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hủy.")}"); return NotFound<bool>("Không tìm thấy lý do hủy."); }
        _unitOfWork.ICancellationReasonRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa lý do hủy thành công."); }
    }
}
