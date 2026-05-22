using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class PriceRuleTypeService : BaseService, IPriceRuleTypeService
{
    public PriceRuleTypeService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<PriceRuleTypeResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IPriceRuleTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<PriceRuleTypes, PriceRuleTypeResponse>(page));
    }

    public async Task<Result<PriceRuleTypeResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) return NotFound<PriceRuleTypeResponse>("Không tìm thấy loại khung giá.");
        return Success(_mapper.Map<PriceRuleTypeResponse>(entity));
    }

    public async Task<Result<PriceRuleTypeResponse>> Create(PriceRuleTypeRequest request)
    {
        var entity = _mapper.Map<PriceRuleTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPriceRuleTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<PriceRuleTypeResponse>(entity));
    }

    public async Task<Result<PriceRuleTypeResponse>> Update(int id, PriceRuleTypeRequest request)
    {
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) return NotFound<PriceRuleTypeResponse>("Không tìm thấy loại khung giá.");
        _mapper.Map(request, entity);
        _unitOfWork.IPriceRuleTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<PriceRuleTypeResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy loại khung giá.");
        _unitOfWork.IPriceRuleTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa loại khung giá thành công.");
    }
}
