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

    public async Task<Result<BookingStatusResponse>> Create(CreateBookingStatusRequest request)
    {
        var entity = _mapper.Map<BookingStatuses>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IBookingStatusRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<BookingStatusResponse>(entity));
    }

    public async Task<Result<BookingStatusResponse>> Update(int id, UpdateBookingStatusRequest request)
    {
        var entity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.BookingStatusID == id);
        if (entity is null) return NotFound<BookingStatusResponse>("Không tìm thấy trạng thái đặt lịch.");
        _mapper.Map(request, entity);
        _unitOfWork.IBookingStatusRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<BookingStatusResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IBookingStatusRepository.FindFirst(x => x.BookingStatusID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy trạng thái đặt lịch.");
        _unitOfWork.IBookingStatusRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa trạng thái đặt lịch thành công.");
    }
}
