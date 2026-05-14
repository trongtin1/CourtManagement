using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class TimeSlotService : BaseService, ITimeSlotService
{
    public TimeSlotService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<TimeSlotResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ITimeSlotRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<TimeSlots, TimeSlotResponse>(page));
    }

    public async Task<Result<TimeSlotResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ITimeSlotRepository.FindFirst(x => x.TimeSlotID == id);
        if (entity is null) return NotFound<TimeSlotResponse>("Không tìm thấy khung giờ.");
        return Success(_mapper.Map<TimeSlotResponse>(entity));
    }

    public async Task<Result<TimeSlotResponse>> Create(CreateTimeSlotRequest request)
    {
        var entity = _mapper.Map<TimeSlots>(request);
        await _unitOfWork.ITimeSlotRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<TimeSlotResponse>(entity));
    }

    public async Task<Result<TimeSlotResponse>> Update(int id, UpdateTimeSlotRequest request)
    {
        var entity = await _unitOfWork.ITimeSlotRepository.FindFirst(x => x.TimeSlotID == id);
        if (entity is null) return NotFound<TimeSlotResponse>("Không tìm thấy khung giờ.");
        _mapper.Map(request, entity);
        _unitOfWork.ITimeSlotRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<TimeSlotResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ITimeSlotRepository.FindFirst(x => x.TimeSlotID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy khung giờ.");
        _unitOfWork.ITimeSlotRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa khung giờ thành công.");
    }
}
