using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtDefaultPriceRuleService : BaseService, ICourtDefaultPriceRuleService
{
    private readonly ILogger<CourtDefaultPriceRuleService> _logger;

    public CourtDefaultPriceRuleService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<CourtDefaultPriceRuleService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtDefaultPriceRuleResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách quy tắc giá mặc định";
        var page = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtDefaultPriceRule, CourtDefaultPriceRuleResponse>(page)); }
    }

    public async Task<Result<List<CourtDefaultPriceRuleResponse>>> GetByDay(int dayOfWeek)
    {
        const string loggingHeader = "Thực hiện Get By Day quy tắc giá mặc định";
        var list = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindList(x => x.DayOfWeek == dayOfWeek);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<CourtDefaultPriceRuleResponse>>(list)); }
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy quy tắc giá mặc định theo ID";
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cấu hình giá mặc định.")}"); return NotFound<CourtDefaultPriceRuleResponse>("Không tìm thấy cấu hình giá mặc định."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtDefaultPriceRuleResponse>(entity)); }
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> Create(CourtDefaultPriceRuleRequest request)
    {
        const string loggingHeader = "Tạo quy tắc giá mặc định";
        var validation = await ValidateRuleWindow(request);
        if (validation is not null) return validation;

        var entity = _mapper.Map<CourtDefaultPriceRule>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        entity.CreatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        await _unitOfWork.ICourtDefaultPriceRuleRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtDefaultPriceRuleResponse>(entity)); }
    }

    public async Task<Result<CourtDefaultPriceRuleResponse>> Update(int id, CourtDefaultPriceRuleRequest request)
    {
        const string loggingHeader = "Cập nhật quy tắc giá mặc định";
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cấu hình giá mặc định.")}"); return NotFound<CourtDefaultPriceRuleResponse>("Không tìm thấy cấu hình giá mặc định."); }
        var validation = await ValidateRuleWindow(request, id);
        if (validation is not null) return validation;

        _mapper.Map(request, entity);
        entity.UpdatedDate = DateTimeOffset.UtcNow;
        entity.UpdatedBy = _currentUser?.UserId?.ToString() ?? string.Empty;
        _unitOfWork.ICourtDefaultPriceRuleRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtDefaultPriceRuleResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa quy tắc giá mặc định";
        var entity = await _unitOfWork.ICourtDefaultPriceRuleRepository.FindFirst(x => x.CourtDefaultPriceRuleID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cấu hình giá mặc định.")}"); return NotFound<bool>("Không tìm thấy cấu hình giá mặc định."); }
        _unitOfWork.ICourtDefaultPriceRuleRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa cấu hình giá mặc định thành công."); }
    }

    private async Task<Result<CourtDefaultPriceRuleResponse>?> ValidateRuleWindow(CourtDefaultPriceRuleRequest request, int? excludeId = null)
    {
        if (request.EndTime <= request.StartTime)
        {
            return BadRequest<CourtDefaultPriceRuleResponse>("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
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
