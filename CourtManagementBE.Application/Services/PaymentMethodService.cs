using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class PaymentMethodService : BaseService, IPaymentMethodService
{
    private readonly ILogger<PaymentMethodService> _logger;

    public PaymentMethodService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PaymentMethodService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<PaymentMethodResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách phương thức thanh toán";
        var page = await _unitOfWork.IPaymentMethodRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<PaymentMethods, PaymentMethodResponse>(page)); }
    }

    public async Task<Result<PaymentMethodResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy phương thức thanh toán theo ID";
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy phương thức thanh toán.")}"); return NotFound<PaymentMethodResponse>("Không tìm thấy phương thức thanh toán."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PaymentMethodResponse>(entity)); }
    }

    public async Task<Result<PaymentMethodResponse>> Create(PaymentMethodRequest request)
    {
        const string loggingHeader = "Tạo phương thức thanh toán";
        var entity = _mapper.Map<PaymentMethods>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentMethodRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<PaymentMethodResponse>(entity)); }
    }

    public async Task<Result<PaymentMethodResponse>> Update(int id, PaymentMethodRequest request)
    {
        const string loggingHeader = "Cập nhật phương thức thanh toán";
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy phương thức thanh toán.")}"); return NotFound<PaymentMethodResponse>("Không tìm thấy phương thức thanh toán."); }
        _mapper.Map(request, entity);
        _unitOfWork.IPaymentMethodRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PaymentMethodResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa phương thức thanh toán";
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy phương thức thanh toán.")}"); return NotFound<bool>("Không tìm thấy phương thức thanh toán."); }
        _unitOfWork.IPaymentMethodRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa phương thức thanh toán thành công."); }
    }
}
