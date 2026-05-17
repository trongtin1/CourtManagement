using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class PaymentStatusService : BaseService, IPaymentStatusService
{
    public PaymentStatusService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<PaymentStatusResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IPaymentStatusRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<PaymentStatuses, PaymentStatusResponse>(page));
    }

    public async Task<Result<PaymentStatusResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) return NotFound<PaymentStatusResponse>("Không tìm thấy trạng thái thanh toán.");
        return Success(_mapper.Map<PaymentStatusResponse>(entity));
    }

    public async Task<Result<PaymentStatusResponse>> Create(CreatePaymentStatusRequest request)
    {
        var entity = _mapper.Map<PaymentStatuses>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<PaymentStatusResponse>(entity));
    }

    public async Task<Result<PaymentStatusResponse>> Update(int id, UpdatePaymentStatusRequest request)
    {
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) return NotFound<PaymentStatusResponse>("Không tìm thấy trạng thái thanh toán.");
        _mapper.Map(request, entity);
        _unitOfWork.IPaymentStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<PaymentStatusResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IPaymentStatusRepository.FindFirst(x => x.PaymentStatusID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy trạng thái thanh toán.");
        _unitOfWork.IPaymentStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa trạng thái thanh toán thành công.");
    }
}
