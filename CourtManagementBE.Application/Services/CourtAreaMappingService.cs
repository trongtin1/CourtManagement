using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class CourtAreaMappingService : BaseService, ICourtAreaMappingService
{
    public CourtAreaMappingService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<CourtAreaMappingResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtAreaMappingRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtAreaMappingResponse>>(list));
    }

    public async Task<Result<List<CourtAreaMappingResponse>>> GetByArea(int areaId)
    {
        var list = await _unitOfWork.ICourtAreaMappingRepository.FindList(x => x.AreaID == areaId);
        return Success(_mapper.Map<List<CourtAreaMappingResponse>>(list));
    }

    public async Task<Result<CourtAreaMappingResponse>> Create(CreateCourtAreaMappingRequest request)
    {
        var entity = _mapper.Map<CourtAreaMapping>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtAreaMappingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtAreaMappingResponse>(entity));
    }

    public async Task<Result<CourtAreaMappingResponse>> Update(int id, UpdateCourtAreaMappingRequest request)
    {
        var entity = await _unitOfWork.ICourtAreaMappingRepository.FindFirst(x => x.CourtAreaMappingID == id);
        if (entity is null) return NotFound<CourtAreaMappingResponse>("Không tìm thấy ánh xạ sân-khu vực.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtAreaMappingRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtAreaMappingResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtAreaMappingRepository.FindFirst(x => x.CourtAreaMappingID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy ánh xạ sân-khu vực.");
        _unitOfWork.ICourtAreaMappingRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa ánh xạ thành công.");
    }
}
