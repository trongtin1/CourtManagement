using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class UnitService : BaseService, IUnitService
{
    public UnitService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<UnitResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IUnitRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Units, UnitResponse>(page));
    }

    public async Task<Result<UnitResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) return NotFound<UnitResponse>("Không tìm thấy đơn vị tính.");
        return Success(_mapper.Map<UnitResponse>(entity));
    }

    public async Task<Result<UnitResponse>> Create(CreateUnitRequest request)
    {
        var entity = _mapper.Map<Units>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IUnitRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<UnitResponse>(entity));
    }

    public async Task<Result<UnitResponse>> Update(int id, UpdateUnitRequest request)
    {
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) return NotFound<UnitResponse>("Không tìm thấy đơn vị tính.");
        _mapper.Map(request, entity);
        _unitOfWork.IUnitRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<UnitResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy đơn vị tính.");
        _unitOfWork.IUnitRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa đơn vị tính thành công.");
    }
}
