using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.IServices;

public interface IBookingGroupService
{
    Task<Result<PageList<BookingGroupResponse>>> GetAll(QueryResource query);
    Task<Result<List<BookingGroupResponse>>> GetByCustomer(int customerId);
    Task<Result<BookingGroupResponse>> GetById(int id);
    Task<Result<string>> Create(BookingGroupRequest request);
    Task<Result<BookingGroupResponse>> Update(int id, BookingGroupRequest request);
    Task<Result<BookingGroupResponse>> Cancel(int id, string reason);
    Task<Result<bool>> Delete(int id);
    Task<Result<BookingGroupResponse>> PayDeposit(int id, BookingPaymentRequest request);
}
