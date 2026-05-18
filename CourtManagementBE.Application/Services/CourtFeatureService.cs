using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class CourtFeatureService : BaseService, ICourtFeatureService
{
    public CourtFeatureService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtFeatureResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtFeatureRepository.FindAll(
            _ => true,
            include: q => q.Include(x => x.CourtFeatureCategory!),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtFeatures, CourtFeatureResponse>(page));
    }

    public async Task<Result<CourtFeatureResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == id,
            include: q => q.Include(x => x.CourtFeatureCategory!));
        if (entity is null) return NotFound<CourtFeatureResponse>("Khong tim thay dac diem san.");
        return Success(_mapper.Map<CourtFeatureResponse>(entity));
    }

    public async Task<Result<CourtFeatureResponse>> Create(CreateCourtFeatureRequest request)
    {
        var entity = _mapper.Map<CourtFeatures>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.ICourtFeatureRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        var saved = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == entity.CourtFeatureID,
            include: q => q.Include(x => x.CourtFeatureCategory!));

        return Created(_mapper.Map<CourtFeatureResponse>(saved ?? entity));
    }

    public async Task<Result<CourtFeatureResponse>> Update(int id, UpdateCourtFeatureRequest request)
    {
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == id);
        if (entity is null) return NotFound<CourtFeatureResponse>("Khong tim thay dac diem san.");

        _mapper.Map(request, entity);
        _unitOfWork.ICourtFeatureRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        var saved = await _unitOfWork.ICourtFeatureRepository.FindFirst(
            x => x.CourtFeatureID == id,
            include: q => q.Include(x => x.CourtFeatureCategory!));

        return Success(_mapper.Map<CourtFeatureResponse>(saved ?? entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtFeatureRepository.FindFirst(x => x.CourtFeatureID == id);
        if (entity is null) return NotFound<bool>("Khong tim thay dac diem san.");
        _unitOfWork.ICourtFeatureRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xoa dac diem san thanh cong.");
    }

}
