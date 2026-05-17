using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class PaymentMethodService : BaseService, IPaymentMethodService
{
    public PaymentMethodService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<PaymentMethodResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IPaymentMethodRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<PaymentMethods, PaymentMethodResponse>(page));
    }

    public async Task<Result<PaymentMethodResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) return NotFound<PaymentMethodResponse>("Không tìm thấy phương thức thanh toán.");
        return Success(_mapper.Map<PaymentMethodResponse>(entity));
    }

    public async Task<Result<PaymentMethodResponse>> Create(CreatePaymentMethodRequest request)
    {
        var entity = _mapper.Map<PaymentMethods>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentMethodRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<PaymentMethodResponse>(entity));
    }

    public async Task<Result<PaymentMethodResponse>> Update(int id, UpdatePaymentMethodRequest request)
    {
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) return NotFound<PaymentMethodResponse>("Không tìm thấy phương thức thanh toán.");
        _mapper.Map(request, entity);
        _unitOfWork.IPaymentMethodRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<PaymentMethodResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IPaymentMethodRepository.FindFirst(x => x.PaymentMethodID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy phương thức thanh toán.");
        _unitOfWork.IPaymentMethodRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa phương thức thanh toán thành công.");
    }
}
