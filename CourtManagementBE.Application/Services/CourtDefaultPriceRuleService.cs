using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class CourtDefaultPriceRuleService : BaseService, ICourtDefaultPriceRuleService
{
    public CourtDefaultPriceRuleService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<CourtDefaultPriceRuleResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<CourtDefaultPriceRule, CourtDefaultPriceRuleResponse>(page));
    }

    public async Task<Result<List<CourtDefaultPriceRuleResponse>>> GetByDay(int dayOfWeek)
    {
        var list = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindList(x => x.DayOfWeek == dayOfWeek);
        return Success(_mapper.Map<List<CourtDefaultPriceRuleResponse>>(list));
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) return NotFound<CourtDefaultPriceRuleResponse>("Không tìm thấy cấu hình giá mặc định.");
        return Success(_mapper.Map<CourtDefaultPriceRuleResponse>(entity));
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> Create(CourtDefaultPriceRuleRequest request)
    {
        var validation = await ValidateRuleWindow(request);
        if (validation is not null) return validation;

        var entity = _mapper.Map<CourtDefaultPriceRule>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        await _unitOfWork.ICourtDefaultPriceRuleRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtDefaultPriceRuleResponse>(entity));
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> Update(int id, CourtDefaultPriceRuleRequest request)
    {
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) return NotFound<CourtDefaultPriceRuleResponse>("Không tìm thấy cấu hình giá mặc định.");
        var validation = await ValidateRuleWindow(request, id);
        if (validation is not null) return validation;

        _mapper.Map(request, entity);
        entity.UpdatedDate = DateTimeOffset.UtcNow;
        entity.UpdatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        _unitOfWork.ICourtDefaultPriceRuleRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<CourtDefaultPriceRuleResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy cấu hình giá mặc định.");
        _unitOfWork.ICourtDefaultPriceRuleRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa cấu hình giá mặc định thành công.");
    }

    private async Task<Result<CourtDefaultPriceRuleResponse>?> ValidateRuleWindow(CourtDefaultPriceRuleRequest request, int? excludeId = null)
    {
        if (request.EndTime <= request.StartTime)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        if (!request.IsLoadDefault && !request.IsMapping)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Cấu hình giá mặc định phải là giá nền hoặc giá overlay.");
        }

        if (request.IsLoadDefault && request.IsMapping)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Không thể vừa là giá nền vừa là giá overlay.");
        }

        if (!request.DayOfWeek.HasValue && !request.SpecificDate.HasValue)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Vui lòng chọn ngày trong tuần hoặc ngày cụ thể.");
        }

        var overlaps = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindList(x =>
            (!excludeId.HasValue || x.CourtDefaultPriceRuleID != excludeId.Value)
            && (
                (request.DayOfWeek.HasValue && x.DayOfWeek == request.DayOfWeek.Value && !x.SpecificDate.HasValue)
                || (request.SpecificDate.HasValue && x.SpecificDate == request.SpecificDate.Value && !x.DayOfWeek.HasValue)
            )
            && x.StartTime < request.EndTime
            && x.EndTime > request.StartTime);

        return overlaps.Any()
            ? BadRequest<CourtDefaultPriceRuleResponse>("Khung giá mặc định bị trùng với cấu hình hiện có.")
            : null;
    }
}
