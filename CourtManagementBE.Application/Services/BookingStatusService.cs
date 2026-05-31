using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class BookingStatusService : BaseService, IBookingStatusService
{
    public BookingStatusService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<BookingStatusResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IBookingStatusRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<BookingStatuses, BookingStatusResponse>(page));
    }

    public async Task<Result<BookingStatusResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.BookingStatusID == id);
        if (entity is null) return NotFound<BookingStatusResponse>("Không tìm thấy trạng thái đặt lịch.");
        return Success(_mapper.Map<BookingStatusResponse>(entity));
    }

    public async Task<Result<BookingStatusResponse>> Create(BookingStatusRequest request)
    {
        var existing = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == request.Code);
        if (existing is not null) return BadRequest<BookingStatusResponse>("Mã trạng thái đã tồn tại.");

        var entity = _mapper.Map<BookingStatuses>(request);
        await _unitOfWork.IBookingStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingStatusResponse>(entity));
    }

    public async Task<Result<BookingStatusResponse>> Update(int id, BookingStatusRequest request)
    {
        var entity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.BookingStatusID == id);
        if (entity is null) return NotFound<BookingStatusResponse>("Không tìm thấy trạng thái đặt lịch.");

        // Check unique code if changed
        if (entity.Code != request.Code)
        {
            var existing = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.Code == request.Code);
            if (existing is not null) return BadRequest<BookingStatusResponse>("Mã trạng thái đã tồn tại.");
        }

        _mapper.Map(request, entity);
        _unitOfWork.IBookingStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingStatusResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.BookingStatusID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy trạng thái đặt lịch.");

        // Prevent deleting core system statuses that are in constants
        if (entity.Code == "001" || entity.Code == "002" || entity.Code == "003" || entity.Code == "004" || entity.Code == "005" || entity.Code == "006")
        {
            return BadRequest<bool>("Không thể xóa trạng thái hệ thống cốt lõi.");
        }

        _unitOfWork.IBookingStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa trạng thái đặt lịch thành công.");
    }
}
