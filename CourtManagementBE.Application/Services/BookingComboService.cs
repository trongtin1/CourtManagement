using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class BookingComboService : BaseService, IBookingComboService
{
    public BookingComboService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<List<BookingComboResponse>>> GetByBooking(Guid bookingId)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingComboResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingComboRepository.FindList(x => x.BookingID == bookingId);
        return Success(_mapper.Map<List<BookingComboResponse>>(list));
    }

    public async Task<Result<BookingComboResponse>> Create(BookingComboRequest request)
    {
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessCombo(request.ComboID))
        {
            return Unauthorized<BookingComboResponse>("Bạn không có quyền thêm combo này vào booking.");
        }

        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == request.ComboID);
        if (combo == null) return NotFound<BookingComboResponse>("Không tìm thấy combo.");

        var entity = _mapper.Map<BookingCombos>(request);
        entity.TotalAmount = request.UnitPrice * request.Quantity - request.DiscountAmount;
        entity.CreatedDate = DateTimeOffset.UtcNow;

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == request.BookingID);
        if (booking != null)
        {
            booking.TotalAmount += entity.TotalAmount;
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        await _unitOfWork.IBookingComboRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingComboResponse>(entity));
    }

    public async Task<Result<BookingComboResponse>> Update(int id, UpdateBookingComboRequest request)
    {
        var entity = await _unitOfWork.IBookingComboRepository.FindFirst(x => x.BookingComboID == id);
        if (entity is null) return NotFound<BookingComboResponse>("Không tìm thấy combo booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<BookingComboResponse>("Bạn không có quyền cập nhật combo booking này.");

        var oldTotalAmount = entity.TotalAmount;
        _mapper.Map(request, entity);
        
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        entity.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        entity.TotalAmount = entity.UnitPrice * entity.Quantity - entity.DiscountAmount;

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == entity.BookingID);
        if (booking != null)
        {
            booking.TotalAmount += (entity.TotalAmount - oldTotalAmount);
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        _unitOfWork.IBookingComboRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingComboResponse>(entity));
    }

    public async Task<Result<List<BookingComboResponse>>> BulkUpdate(Guid bookingId, List<BookingComboBulkUpdateItemRequest> requests)
    {
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingComboResponse>>("Bạn không có quyền cập nhật combo booking này.");

        // Check for duplicates in requests
        var requestIds = requests.Select(x => x.BookingComboID).Where(id => id > 0).ToList();
        if (requestIds.Count != requestIds.Distinct().Count()) 
            return BadRequest<List<BookingComboResponse>>("Danh sách cập nhật có combo booking bị trùng.");

        var requestComboIds = requests.Select(x => x.ComboID).Where(id => id > 0).ToList();
        if (requestComboIds.Count != requestComboIds.Distinct().Count())
            return BadRequest<List<BookingComboResponse>>("Danh sách cập nhật có loại combo bị trùng.");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Load existing entities for this booking
            var existingEntities = await _unitOfWork.IBookingComboRepository.FindList(
                x => x.BookingID == bookingId,
                disableTracking: false);

            var totalDiff = 0m;
            var requestIdsSet = requestIds.ToHashSet();

            // 1. Process Deletions
            var entitiesToDelete = existingEntities.Where(e => !requestIdsSet.Contains(e.BookingComboID)).ToList();
            foreach (var entity in entitiesToDelete)
            {
                totalDiff -= entity.TotalAmount;
                _unitOfWork.IBookingComboRepository.Remove(entity);
            }

            // 2. Process Updates
            foreach (var entity in existingEntities.Where(e => requestIdsSet.Contains(e.BookingComboID)))
            {
                var req = requests.First(r => r.BookingComboID == entity.BookingComboID);
                var oldTotalAmount = entity.TotalAmount;

                entity.Quantity = req.Quantity;
                entity.UnitPrice = req.UnitPrice;
                entity.DiscountAmount = req.DiscountAmount;
                entity.Status = req.Status;
                entity.TotalAmount = req.UnitPrice * req.Quantity - req.DiscountAmount;
                entity.ModifiedDate = DateTimeOffset.UtcNow;
                entity.ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;

                totalDiff += entity.TotalAmount - oldTotalAmount;
                _unitOfWork.IBookingComboRepository.Update(entity);
            }

            // 3. Process Additions
            var addedEntities = new List<BookingCombos>();
            foreach (var req in requests.Where(r => r.BookingComboID <= 0))
            {
                var newEntity = new BookingCombos
                {
                    BookingID = bookingId,
                    ComboID = req.ComboID,
                    Quantity = req.Quantity,
                    UnitPrice = req.UnitPrice,
                    DiscountAmount = req.DiscountAmount,
                    Status = req.Status,
                    TotalAmount = req.UnitPrice * req.Quantity - req.DiscountAmount,
                    CreatedDate = DateTimeOffset.UtcNow,
                    CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty,
                    ModifiedDate = DateTimeOffset.UtcNow,
                    ModifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty
                };

                totalDiff += newEntity.TotalAmount;
                await _unitOfWork.IBookingComboRepository.Add(newEntity);
                addedEntities.Add(newEntity);
            }

            // 4. Update Booking total amount
            var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId, disableTracking: false);
            if (booking != null)
            {
                booking.TotalAmount += totalDiff;
                booking.ModifiedDate = DateTimeOffset.UtcNow;
                _unitOfWork.IBookingRepository.Update(booking);
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            // Load updated list of combos for return
            var updatedEntities = await _unitOfWork.IBookingComboRepository.FindList(
                x => x.BookingID == bookingId,
                disableTracking: true);

            return Success(_mapper.Map<List<BookingComboResponse>>(updatedEntities), "Cập nhật hàng loạt combo booking thành công.");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingComboRepository.FindFirst(x => x.BookingComboID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy combo booking.");
        if (!await CanAccessBooking(entity.BookingID)) return Unauthorized<bool>("Bạn không có quyền xóa combo booking này.");

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == entity.BookingID);
        if (booking != null)
        {
            booking.TotalAmount -= entity.TotalAmount;
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        _unitOfWork.IBookingComboRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa combo booking thành công.");
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }

    private async Task<bool> CanAccessCombo(int comboId)
    {
        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == comboId);
        return combo is not null;
    }
}
