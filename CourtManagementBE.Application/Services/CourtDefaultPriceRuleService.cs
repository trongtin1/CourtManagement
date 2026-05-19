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

    public async Task<Result<CourtDefaultPriceRuleResponse>> Create(CreateCourtDefaultPriceRuleRequest request)
    {
        var validation = await ValidateRuleWindow(request.DayOfWeek, request.StartTime, request.EndTime);
        if (validation is not null) return validation;

        var entity = _mapper.Map<CourtDefaultPriceRule>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        await _unitOfWork.ICourtDefaultPriceRuleRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<CourtDefaultPriceRuleResponse>(entity));
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> Update(int id, UpdateCourtDefaultPriceRuleRequest request)
    {
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) return NotFound<CourtDefaultPriceRuleResponse>("Không tìm thấy cấu hình giá mặc định.");
        var validation = await ValidateRuleWindow(request.DayOfWeek, request.StartTime, request.EndTime, id);
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

    private async Task<Result<CourtDefaultPriceRuleResponse>?> ValidateRuleWindow(
        int dayOfWeek,
        TimeSpan startTime,
        TimeSpan endTime,
        int? excludeId = null)
    {
        if (endTime <= startTime)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
        }

        var overlaps = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindList(x =>
            x.DayOfWeek == dayOfWeek
            && x.IsActive
            && (!excludeId.HasValue || x.CourtDefaultPriceRuleID != excludeId.Value)
            && x.StartTime < endTime
            && x.EndTime > startTime);

        return overlaps.Any()
            ? BadRequest<CourtDefaultPriceRuleResponse>("Khung giá mặc định bị trùng với cấu hình hiện có.")
            : null;
    }
}
