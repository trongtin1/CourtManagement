using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class RefundReasonService : BaseService, IRefundReasonService
{
    private readonly ILogger<RefundReasonService> _logger;

    public RefundReasonService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<RefundReasonService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<RefundReasonResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách lý do hoàn tiền";
        var page = await _unitOfWork.IRefundReasonRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<RefundReasons, RefundReasonResponse>(page)); }
    }

    public async Task<Result<RefundReasonResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy lý do hoàn tiền theo ID";
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hoàn tiền.")}"); return NotFound<RefundReasonResponse>("Không tìm thấy lý do hoàn tiền."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<RefundReasonResponse>(entity)); }
    }

    public async Task<Result<RefundReasonResponse>> Create(RefundReasonRequest request)
    {
        const string loggingHeader = "Tạo lý do hoàn tiền";
        var entity = _mapper.Map<RefundReasons>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IRefundReasonRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<RefundReasonResponse>(entity)); }
    }

    public async Task<Result<RefundReasonResponse>> Update(int id, RefundReasonRequest request)
    {
        const string loggingHeader = "Cập nhật lý do hoàn tiền";
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hoàn tiền.")}"); return NotFound<RefundReasonResponse>("Không tìm thấy lý do hoàn tiền."); }
        _mapper.Map(request, entity);
        _unitOfWork.IRefundReasonRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<RefundReasonResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa lý do hoàn tiền";
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy lý do hoàn tiền.")}"); return NotFound<bool>("Không tìm thấy lý do hoàn tiền."); }
        _unitOfWork.IRefundReasonRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa lý do hoàn tiền thành công."); }
    }
}
