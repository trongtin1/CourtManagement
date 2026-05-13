using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class CourtUtilityService : BaseService, ICourtUtilityService
{
    public CourtUtilityService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<CourtUtilityResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtUtilityRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtUtilityResponse>>(list));
    }

    public async Task<Result<CourtUtilityResponse>> Create(CreateCourtUtilityRequest request)
    {
        var existing = await _unitOfWork.ICourtUtilityRepository.FindFirst(
            x => x.CourtID == request.CourtID && x.UtilityID == request.UtilityID);
        if (existing is not null) return BadRequest<CourtUtilityResponse>("Tiện ích đã được gán cho sân này.");

        var entity = _mapper.Map<CourtUtilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtUtilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtUtilityResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtUtilityRepository.FindFirst(x => x.CourtUtilitiesID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy tiện ích sân.");
        _unitOfWork.ICourtUtilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Gỡ tiện ích khỏi sân thành công.");
    }
}
