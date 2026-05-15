using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class CourtFeatureMappingService : BaseService, ICourtFeatureMappingService
{
    public CourtFeatureMappingService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<CourtFeatureMappingResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtFeatureMappingRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtFeatureMappingResponse>>(list));
    }

    public async Task<Result<CourtFeatureMappingResponse>> Create(CreateCourtFeatureMappingRequest request)
    {
        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == request.CourtID);
        if (court is null) return NotFound<CourtFeatureMappingResponse>("Khong tim thay san.");

        var feature = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == request.CourtFeatureID);
        if (feature is null) return NotFound<CourtFeatureMappingResponse>("Khong tim thay dac tinh san.");

        var existing = await _unitOfWork.ICourtFeatureMappingRepository.FindFirst(
            x => x.CourtID == request.CourtID && x.CourtFeatureID == request.CourtFeatureID);
        if (existing is not null) return BadRequest<CourtFeatureMappingResponse>("Dac tinh da duoc gan cho san nay.");

        var entity = _mapper.Map<CourtFeatureMappings>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureMappingRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtFeatureMappingResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtFeatureMappingRepository.FindFirst(x => x.CourtFeatureMappingID == id);
        if (entity is null) return NotFound<bool>("Khong tim thay dac tinh san da gan.");
        _unitOfWork.ICourtFeatureMappingRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Go dac tinh khoi san thanh cong.");
    }
}
