using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.DTOs.Response;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.Resources;

namespace CourtManagementBE.Application.IServices;

public interface IBookingService
{
    Task<Result<PageList<BookingResponse>>> GetAll(BookingResource query);
    Task<Result<List<BookingResponse>>> GetByCustomer(int customerId);
    Task<Result<List<BookingResponse>>> GetByCourt(int courtId);
    Task<Result<List<BookingResponse>>> GetByStatus(string status);
    Task<Result<List<BookingResponse>>> GetByDate(DateTime date);
    Task<Result<BookingResponse>> GetById(Guid id);
    Task<Result<BookingResponse>> Create(BookingRequest request);
    Task<Result<BookingResponse>> CreateFull(CreateFullBookingRequest request);
    Task<Result<BookingResponse>> Update(Guid id, BookingRequest request);
    Task<Result<BookingResponse>> Cancel(Guid id, BookingRequest request);
    Task<Result<BookingResponse>> UpdateStatus(Guid id, string status);
    Task<Result<BookingResponse>> Pay(Guid id, BookingPaymentRequest request);
    Task<Result<BookingResponse>> Refund(Guid id, BookingRefundRequest request);
    Task<Result<BookingResponse>> Reschedule(Guid id, RescheduleBookingRequest request);
    Task<Result<List<BookingStatusResponse>>> GetStatuses();
    Task<Result<bool>> Delete(Guid id);
    Task<Result<List<BookingHistoryResponse>>> GetHistory(Guid? bookingId);
}
