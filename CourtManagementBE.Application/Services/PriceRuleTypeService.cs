using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class PriceRuleTypeService : BaseService, IPriceRuleTypeService
{
    private readonly ILogger<PriceRuleTypeService> _logger;

    public PriceRuleTypeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PriceRuleTypeService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<PriceRuleTypeResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách loại quy tắc giá";
        var page = await _unitOfWork.IPriceRuleTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<PriceRuleTypes, PriceRuleTypeResponse>(page)); }
    }

    public async Task<Result<PriceRuleTypeResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy loại quy tắc giá theo ID";
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khung giá.")}"); return NotFound<PriceRuleTypeResponse>("Không tìm thấy loại khung giá."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PriceRuleTypeResponse>(entity)); }
    }

    public async Task<Result<PriceRuleTypeResponse>> Create(PriceRuleTypeRequest request)
    {
        const string loggingHeader = "Tạo loại quy tắc giá";
        var entity = _mapper.Map<PriceRuleTypes>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IPriceRuleTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<PriceRuleTypeResponse>(entity)); }
    }

    public async Task<Result<PriceRuleTypeResponse>> Update(int id, PriceRuleTypeRequest request)
    {
        const string loggingHeader = "Cập nhật loại quy tắc giá";
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khung giá.")}"); return NotFound<PriceRuleTypeResponse>("Không tìm thấy loại khung giá."); }
        _mapper.Map(request, entity);
        _unitOfWork.IPriceRuleTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<PriceRuleTypeResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa loại quy tắc giá";
        var entity = await _unitOfWork.IPriceRuleTypeRepository.FindFirst(x => x.PriceRuleTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại khung giá.")}"); return NotFound<bool>("Không tìm thấy loại khung giá."); }
        _unitOfWork.IPriceRuleTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa loại khung giá thành công."); }
    }
}
