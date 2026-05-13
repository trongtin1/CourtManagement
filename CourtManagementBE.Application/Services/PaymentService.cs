using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class PaymentService : BaseService, IPaymentService
{
    public PaymentService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<PaymentResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IPaymentRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Payments, PaymentResponse>(page));
    }

    public async Task<Result<List<PaymentResponse>>> GetByBooking(Guid bookingId)
    {
        var list = await _unitOfWork.IPaymentRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<PaymentResponse>>(list));
    }

    public async Task<Result<PaymentResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null) return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        return Success(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Create(CreatePaymentRequest request)
    {
        var entity = _mapper.Map<Payments>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPaymentRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<PaymentResponse>(entity));
    }

    public async Task<Result<PaymentResponse>> Update(int id, UpdatePaymentRequest request)
    {
        var entity = await _unitOfWork.IPaymentRepository.FindFirst(x => x.PaymentID == id);
        if (entity is null) return NotFound<PaymentResponse>("Không tìm thấy thanh toán.");
        _mapper.Map(request, entity);
        _unitOfWork.IPaymentRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<PaymentResponse>(entity));
    }
}
