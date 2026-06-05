using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class UnitConversionService : BaseService, IUnitConversionService
{
    private readonly ILogger<UnitConversionService> _logger;

    public UnitConversionService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<UnitConversionService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<List<UnitConversionResponse>>> GetByService(int serviceId)
    {
        const string loggingHeader = "Thực hiện Get By Service quy đổi đơn vị";
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        if (service is null) return NotFound<List<UnitConversionResponse>>("Không tìm thấy dịch vụ.");
        if (!CanAccessService(service)) return Unauthorized<List<UnitConversionResponse>>("Bạn không có quyền truy cập dịch vụ này.");

        var list = await _unitOfWork.IUnitConversionRepository.FindList(
            x => x.ServiceID == serviceId,
            include: q => q.Include(x => x.SourceUnit).Include(x => x.TargetUnit)
        );

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<UnitConversionResponse>>(list)); }
    }

    public async Task<Result<UnitConversionResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy quy đổi đơn vị theo ID";
        var entity = await _unitOfWork.IUnitConversionRepository.FindFirst(
            x => x.UnitConversionID == id,
            include: q => q.Include(x => x.SourceUnit).Include(x => x.TargetUnit)
        );

        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy quy tắc quy đổi.")}"); return NotFound<UnitConversionResponse>("Không tìm thấy quy tắc quy đổi."); }
        
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == entity.ServiceID);
        if (service is null || !CanAccessService(service)) 
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập quy tắc này.")}"); return Unauthorized<UnitConversionResponse>("Bạn không có quyền truy cập quy tắc này."); }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UnitConversionResponse>(entity)); }
    }

    public async Task<Result<UnitConversionResponse>> Create(UnitConversionRequest request)
    {
        const string loggingHeader = "Tạo quy đổi đơn vị";
        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == request.ServiceID);
        if (service is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy dịch vụ tương ứng.")}"); return NotFound<UnitConversionResponse>("Không tìm thấy dịch vụ tương ứng."); }
        if (!CanAccessService(service)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền thao tác dịch vụ này.")}"); return Unauthorized<UnitConversionResponse>("Bạn không có quyền thao tác dịch vụ này."); }

        // Tránh trùng lặp cặp đơn vị tính gốc - quy đổi cho cùng một dịch vụ
        var exists = await _unitOfWork.IUnitConversionRepository.FindFirst(x => 
            x.ServiceID == request.ServiceID && 
            x.SourceUnitID == request.SourceUnitID && 
            x.TargetUnitID == request.TargetUnitID) != null;

        if (exists) { _logger.LogWarning($"{loggingHeader} - {("Quy tắc quy đổi cho cặp đơn vị này đã tồn tại.")}"); return BadRequest<UnitConversionResponse>("Quy tắc quy đổi cho cặp đơn vị này đã tồn tại."); }

        var entity = _mapper.Map<UnitConversions>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;

        await _unitOfWork.IUnitConversionRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        // Load lại đầy đủ để map tên đơn vị tính
        var loaded = await _unitOfWork.IUnitConversionRepository.FindFirst(
            x => x.UnitConversionID == entity.UnitConversionID,
            include: q => q.Include(x => x.SourceUnit).Include(x => x.TargetUnit)
        );

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<UnitConversionResponse>(loaded)); }
    }

    public async Task<Result<UnitConversionResponse>> Update(int id, UnitConversionRequest request)
    {
        const string loggingHeader = "Cập nhật quy đổi đơn vị";
        var entity = await _unitOfWork.IUnitConversionRepository.FindFirst(x => x.UnitConversionID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy quy tắc quy đổi.")}"); return NotFound<UnitConversionResponse>("Không tìm thấy quy tắc quy đổi."); }

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == entity.ServiceID);
        if (service is null || !CanAccessService(service)) 
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật quy tắc này.")}"); return Unauthorized<UnitConversionResponse>("Bạn không có quyền cập nhật quy tắc này."); }

        _mapper.Map(request, entity);
        _unitOfWork.IUnitConversionRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        var loaded = await _unitOfWork.IUnitConversionRepository.FindFirst(
            x => x.UnitConversionID == entity.UnitConversionID,
            include: q => q.Include(x => x.SourceUnit).Include(x => x.TargetUnit)
        );

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UnitConversionResponse>(loaded)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa quy đổi đơn vị";
        var entity = await _unitOfWork.IUnitConversionRepository.FindFirst(x => x.UnitConversionID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy quy tắc quy đổi.")}"); return NotFound<bool>("Không tìm thấy quy tắc quy đổi."); }

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == entity.ServiceID);
        if (service is null || !CanAccessService(service)) 
            { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa quy tắc này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa quy tắc này."); }

        _unitOfWork.IUnitConversionRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa quy tắc quy đổi thành công."); }
    }

    public async Task<Result<decimal>> ConvertQuantity(int serviceId, int fromUnitId, int toUnitId, decimal quantity)
    {
        const string loggingHeader = "Thực hiện Convert Quantity quy đổi đơn vị";
        if (fromUnitId == toUnitId) { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(quantity); }

        var service = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == serviceId);
        if (service is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy dịch vụ.")}"); return NotFound<decimal>("Không tìm thấy dịch vụ."); }
        if (!CanAccessService(service)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập dịch vụ này.")}"); return Unauthorized<decimal>("Bạn không có quyền truy cập dịch vụ này."); }

        // Lấy tất cả các quy tắc quy đổi hoạt động của dịch vụ
        var conversions = await _unitOfWork.IUnitConversionRepository.FindList(x => x.ServiceID == serviceId && x.IsActive);

        // Quy đổi về Đơn vị cơ bản (BaseUnit / UnitID) trước
        decimal baseQuantity = quantity;
        int baseUnitId = service.UnitID ?? 0;

        if (baseUnitId == 0) { _logger.LogWarning($"{loggingHeader} - {("Dịch vụ này chưa được thiết lập đơn vị tính cơ bản.")}"); return BadRequest<decimal>("Dịch vụ này chưa được thiết lập đơn vị tính cơ bản."); }

        // 1. Chuyển từ fromUnitId về BaseUnit
        if (fromUnitId != baseUnitId)
        {
            var ruleFrom = conversions.FirstOrDefault(x => x.SourceUnitID == fromUnitId && x.TargetUnitID == baseUnitId);
            if (ruleFrom != null)
            {
                baseQuantity = quantity * ruleFrom.Factor;
            }
            else
            {
                // Thử đảo chiều (Target -> Source)
                var ruleFromRev = conversions.FirstOrDefault(x => x.SourceUnitID == baseUnitId && x.TargetUnitID == fromUnitId);
                if (ruleFromRev != null && ruleFromRev.Factor != 0)
                {
                    baseQuantity = quantity / ruleFromRev.Factor;
                }
                else
                {
                    { _logger.LogWarning($"{loggingHeader} - {($"Không có quy tắc quy đổi từ đơn vị {fromUnitId} về đơn vị cơ bản.")}"); return BadRequest<decimal>($"Không có quy tắc quy đổi từ đơn vị {fromUnitId} về đơn vị cơ bản."); }
                }
            }
        }

        // 2. Chuyển từ BaseUnit sang toUnitId
        decimal resultQuantity = baseQuantity;
        if (toUnitId != baseUnitId)
        {
            var ruleTo = conversions.FirstOrDefault(x => x.SourceUnitID == toUnitId && x.TargetUnitID == baseUnitId);
            if (ruleTo != null && ruleTo.Factor != 0)
            {
                resultQuantity = baseQuantity / ruleTo.Factor;
            }
            else
            {
                // Thử đảo chiều
                var ruleToRev = conversions.FirstOrDefault(x => x.SourceUnitID == baseUnitId && x.TargetUnitID == toUnitId);
                if (ruleToRev != null)
                {
                    resultQuantity = baseQuantity * ruleToRev.Factor;
                }
                else
                {
                    { _logger.LogWarning($"{loggingHeader} - {($"Không có quy tắc quy đổi từ đơn vị cơ bản sang đơn vị {toUnitId}.")}"); return BadRequest<decimal>($"Không có quy tắc quy đổi từ đơn vị cơ bản sang đơn vị {toUnitId}."); }
                }
            }
        }

        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(resultQuantity, "Quy đổi đơn vị thành công."); }
    }

    private bool CanAccessService(Domain.Entities.Services service)
        => service.FacilityID is null || CanAccessFacility(service.FacilityID.Value);
}
