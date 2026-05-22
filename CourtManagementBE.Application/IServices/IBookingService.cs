using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IBookingService
{
    Task<Result<PageList<BookingResponse>>> GetAll(QueryResource query);
    Task<Result<List<BookingResponse>>> GetByCustomer(int customerId);
    Task<Result<List<BookingResponse>>> GetByCourt(int courtId);
    Task<Result<List<BookingResponse>>> GetByStatus(string status);
    Task<Result<List<BookingResponse>>> GetByDate(DateTime date);
    Task<Result<BookingResponse>> GetById(Guid id);
    Task<Result<BookingResponse>> Create(BookingRequest request);
    Task<Result<BookingResponse>> Update(Guid id, BookingRequest request);
    Task<Result<BookingResponse>> Cancel(Guid id, BookingRequest request);
    Task<Result<bool>> Delete(Guid id);
}
