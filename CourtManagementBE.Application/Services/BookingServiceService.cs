using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingServiceService : BaseService, IBookingServiceService
{
    public BookingServiceService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<BookingServiceResponse>>> GetByBooking(Guid bookingId)
    {
        var list = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingServiceResponse>>(list));
    }

    public async Task<Result<BookingServiceResponse>> Create(CreateBookingServiceRequest request)
    {
        var entity = _mapper.Map<BookingServices>(request);
        entity.TotalAmount = request.UnitPrice * request.Quantity - request.DiscountAmount;
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<BookingServiceResponse>> Update(int id, UpdateBookingServiceRequest request)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<BookingServiceResponse>("Không tìm thấy dịch vụ booking.");
        _mapper.Map(request, entity);
        entity.TotalAmount = entity.UnitPrice * request.Quantity - request.DiscountAmount;
        _unitOfWork.IBookingServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ booking.");
        _unitOfWork.IBookingServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa dịch vụ booking thành công.");
    }
}
