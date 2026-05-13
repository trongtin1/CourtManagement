using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtTypeService : BaseService, ICourtTypeService
{
    public CourtTypeService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<CourtTypeResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtTypes, CourtTypeResponse>(page));
    }

    public async Task<Result<CourtTypeResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) return NotFound<CourtTypeResponse>("Không tìm thấy loại sân.");
        return Success(_mapper.Map<CourtTypeResponse>(entity));
    }

    public async Task<Result<CourtTypeResponse>> Create(CreateCourtTypeRequest request)
    {
        var entity = _mapper.Map<CourtTypes>(request);
        await _unitOfWork.ICourtTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtTypeResponse>(entity));
    }

    public async Task<Result<CourtTypeResponse>> Update(int id, UpdateCourtTypeRequest request)
    {
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) return NotFound<CourtTypeResponse>("Không tìm thấy loại sân.");
        _mapper.Map(request, entity);
        _unitOfWork.ICourtTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtTypeResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy loại sân.");
        _unitOfWork.ICourtTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa loại sân thành công.");
    }
}
