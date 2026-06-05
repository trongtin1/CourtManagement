using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class PaymentStatusService : BaseService, IPaymentStatusService
{
    private readonly ILogger<PaymentStatusService> _logger;

    public PaymentStatusService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PaymentStatusService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<PaymentStatusResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách trạng thái thanh toán";
        var page = await _unitOfWork.IPaymentStatusRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<PaymentStatuses, PaymentStatusResponse>(page)); }
    }

    public async Task<Result<PaymentStatusResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy trạng thái thanh toán theo ID";
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái thanh toán.")}"); return NotFound<PaymentStatusResponse>("Không tìm thấy trạng thái thanh toán."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PaymentStatusResponse>(entity)); }
    }

    public async Task<Result<PaymentStatusResponse>> Create(PaymentStatusRequest request)
    {
        const string loggingHeader = "Tạo trạng thái thanh toán";
        var entity = _mapper.Map<PaymentStatuses>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<PaymentStatusResponse>(entity)); }
    }

    public async Task<Result<PaymentStatusResponse>> Update(int id, PaymentStatusRequest request)
    {
        const string loggingHeader = "Cập nhật trạng thái thanh toán";
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái thanh toán.")}"); return NotFound<PaymentStatusResponse>("Không tìm thấy trạng thái thanh toán."); }
        _mapper.Map(request, entity);
        _unitOfWork.IPaymentStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PaymentStatusResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa trạng thái thanh toán";
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy trạng thái thanh toán.")}"); return NotFound<bool>("Không tìm thấy trạng thái thanh toán."); }
        _unitOfWork.IPaymentStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa trạng thái thanh toán thành công."); }
    }
}
