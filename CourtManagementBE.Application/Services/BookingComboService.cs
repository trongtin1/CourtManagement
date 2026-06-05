using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class BookingComboService : BaseService, IBookingComboService
{
    private readonly ILogger<BookingComboService> _logger;

    public BookingComboService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<BookingComboService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<List<BookingComboResponse>>> GetByBooking(Guid bookingId)
    {
        const string loggingHeader = "Thực hiện Get By Booking combo đặt sân";
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingComboResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingComboRepository.FindList(x => x.BookingID == bookingId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingComboResponse>>(list)); }
    }

    public async Task<Result<BookingComboResponse>> Create(BookingComboRequest request)
    {
        const string loggingHeader = "Tạo combo đặt sân";
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessCombo(request.ComboID))
        {
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền thêm combo này vào booking.")}"); return Unauthorized<BookingComboResponse>("Bạn không có quyền thêm combo này vào booking."); }
        }

        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == request.ComboID);
        if (combo == null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy combo.")}"); return NotFound<BookingComboResponse>("Không tìm thấy combo."); }

        var entity = _mapper.Map<BookingCombos>(request);
        entity.TotalAmount = request.UnitPrice * request.Quantity;
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
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<BookingComboResponse>(entity)); }
    }

    public async Task<Result<BookingComboResponse>> Update(int id, UpdateBookingComboRequest request)
    {
        const string loggingHeader = "Cập nhật combo đặt sân";
        var entity = await _unitOfWork.IBookingComboRepository.FindFirst(x => x.BookingComboID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy combo booking.")}"); return NotFound<BookingComboResponse>("Không tìm thấy combo booking."); }
        if (!await CanAccessBooking(entity.BookingID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật combo booking này.")}"); return Unauthorized<BookingComboResponse>("Bạn không có quyền cập nhật combo booking này."); }

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

        _unitOfWork.IBookingComboRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<BookingComboResponse>(entity)); }
    }

    public async Task<Result<List<BookingComboResponse>>> BulkUpdate(Guid bookingId, List<BookingComboBulkUpdateItemRequest> requests)
    {
        const string loggingHeader = "Thực hiện Bulk Update combo đặt sân";
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingComboResponse>>("Bạn không có quyền cập nhật combo booking này.");

        // Check for duplicates in requests
        var requestIds = requests.Select(x => x.BookingComboID).Where(id => id > 0).ToList();
        if (requestIds.Count != requestIds.Distinct().Count())
            return BadRequest<List<BookingComboResponse>>("Danh sách cập nhật có combo booking bị trùng.");

        var requestComboIds = requests.Select(x => x.ComboID).Where(id => id > 0).ToList();
        if (requestComboIds.Count != requestComboIds.Distinct().Count())
            return BadRequest<List<BookingComboResponse>>("Danh sách cập nhật có loại combo bị trùng.");

        var modifiedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        var errorMessage = await _unitOfWork.IBookingComboRepository.BulkUpdateBookingCombosAsync(bookingId, modifiedBy, requests);

        if (!string.IsNullOrEmpty(errorMessage))
        {
            return BadRequest<List<BookingComboResponse>>(errorMessage);
        }

        // Load updated list of combos for return
        var updatedEntities = await _unitOfWork.IBookingComboRepository.FindList(
            x => x.BookingID == bookingId,
            disableTracking: true);

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingComboResponse>>(updatedEntities), "Cập nhật hàng loạt combo booking thành công."); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa combo đặt sân";
        var entity = await _unitOfWork.IBookingComboRepository.FindFirst(x => x.BookingComboID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy combo booking.")}"); return NotFound<bool>("Không tìm thấy combo booking."); }
        if (!await CanAccessBooking(entity.BookingID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa combo booking này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa combo booking này."); }

        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == entity.BookingID);
        if (booking != null)
        {
            booking.TotalAmount -= entity.TotalAmount;
            booking.ModifiedDate = DateTimeOffset.UtcNow;
            _unitOfWork.IBookingRepository.Update(booking);
        }

        _unitOfWork.IBookingComboRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa combo booking thành công."); }
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
