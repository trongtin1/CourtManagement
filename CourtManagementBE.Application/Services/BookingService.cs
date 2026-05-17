using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class BookingService : BaseService, IBookingService
{
    public BookingService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<BookingResponse>>> GetAll(QueryResource query)
    {
        var courtIds = await GetScopedCourtIds();
        var page = await _unitOfWork.IBookingRepository.FindAll(
            x => courtIds.Contains(x.CourtID),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Bookings, BookingResponse>(page));
    }

    public async Task<Result<List<BookingResponse>>> GetByCustomer(int customerId)
    {
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CustomerID == customerId && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByCourt(int courtId)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<BookingResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByStatus(string status)
    {
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.Status == status && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<List<BookingResponse>>> GetByDate(DateTime date)
    {
        var courtIds = await GetScopedCourtIds();
        var list = await _unitOfWork.IBookingRepository.FindList(x => x.BookingDate.Date == date.Date && courtIds.Contains(x.CourtID));
        return Success(_mapper.Map<List<BookingResponse>>(list));
    }

    public async Task<Result<BookingResponse>> GetById(Guid id)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền truy cập booking này.");
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Create(CreateBookingRequest request)
    {
        if (!await CanAccessCourt(request.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền tạo booking cho sân này.");

        var entity = _mapper.Map<Bookings>(request);
        entity.BookingID = Guid.NewGuid();
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Update(Guid id, UpdateBookingRequest request)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền cập nhật booking này.");
        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IBookingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingResponse>(entity));
    }

    public async Task<Result<BookingResponse>> Cancel(Guid id, CancelBookingRequest request)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<BookingResponse>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<BookingResponse>("Bạn không có quyền hủy booking này.");
        if (entity.Status == "cancelled") return BadRequest<BookingResponse>("Đơn đặt sân đã bị hủy trước đó.");

        entity.Status = "cancelled";
        entity.CancellationReason = request.CancellationReason;
        entity.CancelledAt = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IBookingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingResponse>(entity), "Hủy đơn đặt sân thành công.");
    }

    public async Task<Result<bool>> Delete(Guid id)
    {
        var entity = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy đơn đặt sân.");
        if (!await CanAccessCourt(entity.CourtID)) return Unauthorized<bool>("Bạn không có quyền xóa booking này.");
        _unitOfWork.IBookingRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa đơn đặt sân thành công.");
    }
}
