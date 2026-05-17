using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IBookingStatusService
{
    Task<Result<PageList<BookingStatusResponse>>> GetAll(QueryResource query);
    Task<Result<BookingStatusResponse>> GetById(int id);
    Task<Result<BookingStatusResponse>> Create(CreateBookingStatusRequest req);
    Task<Result<BookingStatusResponse>> Update(int id, UpdateBookingStatusRequest req);
    Task<Result<bool>> Delete(int id);
}
