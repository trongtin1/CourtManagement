using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingServiceService : BaseService, IBookingServiceService
{
    public BookingServiceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<List<BookingServiceResponse>>> GetByBooking(Guid bookingId)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingServiceResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingServiceResponse>>(list));
    }

    public async Task<Result<BookingServiceResponse>> Create(BookingServiceRequest request)
    {
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessService(request.ServiceID))
        {
            return Unauthorized<BookingServiceResponse>("Bạn không có quyền thêm dịch vụ này vào booking.");
        }

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == request.ServiceID);
        if (service == null) return NotFound<BookingServiceResponse>("Không tìm thấy dịch vụ.");

        if (service.IsTrackStock)
        {
            if (service.StockQuantity < request.Quantity)
            {
                return BadRequest<BookingServiceResponse>($"Dịch vụ {service.ServiceName} không đủ tồn kho (Hiện còn: {service.StockQuantity}).");
            }
            service.StockQuantity -= request.Quantity;
            _unitOfWork.IServiceRepository.Update(service);
        }

        var entity = _mapper.Map<BookingServices>(request);
        entity.TotalAmount = request.UnitPrice * request.Quantity;
        entity.CreatedDate = DateTimeOffset.UtcNow;

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == request.BookingID);
        if (booking != null)
        {
            booking.TotalAmount += entity.TotalAmount;
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        await _unitOfWork.IBookingServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<BookingServiceResponse>> Update(int id, UpdateBookingServiceRequest request)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<BookingServiceResponse>("Không tìm thấy dịch vụ booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<BookingServiceResponse>("Bạn không có quyền cập nhật dịch vụ booking này.");

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == entity.ServiceID);
        if (service != null && service.IsTrackStock)
        {
            var stockDiff = request.Quantity - entity.Quantity;
            if (service.StockQuantity < stockDiff)
            {
                return BadRequest<BookingServiceResponse>($"Dịch vụ {service.ServiceName} không đủ tồn kho (Hiện còn: {service.StockQuantity}).");
            }
            service.StockQuantity -= stockDiff;
            _unitOfWork.IServiceRepository.Update(service);
        }

        var oldTotalAmount = entity.TotalAmount;
        _mapper.Map(request, entity);

        entity.ModifiedDate = DateTimeOffset.UtcNow;
        entity.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        entity.TotalAmount = entity.UnitPrice * entity.Quantity;

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == entity.BookingID);
        if (booking != null)
        {
            booking.TotalAmount += (entity.TotalAmount - oldTotalAmount);
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        _unitOfWork.IBookingServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingServiceResponse>(entity));
    }

    public async Task<Result<List<BookingServiceResponse>>> BulkUpdate(Guid bookingId, List<BookingServiceBulkUpdateItemRequest> requests)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingServiceResponse>>("Bạn không có quyền cập nhật dịch vụ booking này.");

        // Check for duplicates in requests
        var requestIds = requests.Select(x => x.BookingServiceID).Where(id => id > 0).ToList();
        if (requestIds.Count != requestIds.Distinct().Count())
            return BadRequest<List<BookingServiceResponse>>("Danh sách cập nhật có dịch vụ booking bị trùng.");

        var requestServiceIds = requests.Select(x => x.ServiceID).Where(id => id > 0).ToList();
        if (requestServiceIds.Count != requestServiceIds.Distinct().Count())
            return BadRequest<List<BookingServiceResponse>>("Danh sách cập nhật có loại dịch vụ bị trùng.");

        var modifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        var errorMessage = await _unitOfWork.IBookingServiceRepository.BulkUpdateBookingServicesAsync(bookingId, modifiedBy, requests);

        if (!string.IsNullOrEmpty(errorMessage))
        {
            return BadRequest<List<BookingServiceResponse>>(errorMessage);
        }

        // Load the updated list of services for return
        var finalEntities = await _unitOfWork.IBookingServiceRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingServiceResponse>>(finalEntities), "Cập nhật dịch vụ booking thành công.");
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingServiceRepository.FindFirst(x => x.BookingServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<bool>("Bạn không có quyền xóa dịch vụ booking này.");

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == entity.ServiceID);
        if (service != null && service.IsTrackStock)
        {
            service.StockQuantity += entity.Quantity;
            _unitOfWork.IServiceRepository.Update(service);
        }

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == entity.BookingID);
        if (booking != null)
        {
            booking.TotalAmount -= entity.TotalAmount;
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        _unitOfWork.IBookingServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa dịch vụ booking thành công.");
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }

    private async Task<bool> CanAccessService(int serviceId)
    {
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        return service is not null && (service.FacilityID is null || CanAccessFacility(service.FacilityID.Value));
    }
}
