using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class BookingSlotService : BaseService, IBookingSlotService
{
    private readonly ILogger<BookingSlotService> _logger;

    public BookingSlotService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<BookingSlotService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<List<BookingSlotResponse>>> GetByBooking(Guid bookingId)
    {
        const string loggingHeader = "Thực hiện Get By Booking khung giờ đặt sân";
        if (!await CanAccessBooking(bookingId)) return Unauthorized<List<BookingSlotResponse>>("Bạn không có quyền truy cập booking này.");
        var list = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingID == bookingId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingSlotResponse>>(list)); }
    }

    public async Task<Result<List<BookingSlotResponse>>> GetByCourtAndDate(int courtId, DateTime date)
    {
        const string loggingHeader = "Thực hiện Get By Court And Date khung giờ đặt sân";
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<BookingSlotResponse>>("Bạn không có quyền truy cập sân này.");
        var dateOnly = DateOnly.FromDateTime(date);
        var list = await _unitOfWork.IBookingSlotRepository.FindList(x => x.CourtID == courtId && x.BookingDate == dateOnly);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingSlotResponse>>(list)); }
    }

    public async Task<Result<List<BookingSlotResponse>>> GetByDate(DateTime date)
    {
        const string loggingHeader = "Thực hiện Get By Date khung giờ đặt sân";
        var courtIds = await GetScopedCourtIds();
        var dateOnly = DateOnly.FromDateTime(date);
        var list = await _unitOfWork.IBookingSlotRepository.FindList(x => x.BookingDate == dateOnly && courtIds.Contains(x.CourtID));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<BookingSlotResponse>>(list)); }
    }

    public async Task<Result<BookingSlotResponse>> Create(BookingSlotRequest request)
    {
        const string loggingHeader = "Tạo khung giờ đặt sân";
        if (!await CanAccessBooking(request.BookingID) || !await CanAccessCourt(request.CourtID))
        {
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền tạo slot cho booking hoặc sân này.")}"); return Unauthorized<BookingSlotResponse>("Bạn không có quyền tạo slot cho booking hoặc sân này."); }
        }

        var entity = _mapper.Map<BookingSlots>(request);
        await _unitOfWork.IBookingSlotRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<BookingSlotResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa khung giờ đặt sân";
        var entity = await _unitOfWork.IBookingSlotRepository.FindFirst(x => x.ID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy slot đặt sân.")}"); return NotFound<bool>("Không tìm thấy slot đặt sân."); }
        if (!await CanAccessBooking(entity.BookingID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa slot này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa slot này."); }
        _unitOfWork.IBookingSlotRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa slot thành công."); }
    }

    private async Task<bool> CanAccessBooking(Guid bookingId)
    {
        var booking = await _unitOfWork.IBookingRepository.FindFirst(x => x.BookingID == bookingId);
        return booking is not null && await CanAccessCourt(booking.CourtID);
    }
}
