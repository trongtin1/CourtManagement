using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class UnitService : BaseService, IUnitService
{
    private readonly ILogger<UnitService> _logger;

    public UnitService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<UnitService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<UnitResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách đơn vị";
        var page = await _unitOfWork.IUnitRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<Units, UnitResponse>(page)); }
    }

    public async Task<Result<UnitResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy đơn vị theo ID";
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy đơn vị tính.")}"); return NotFound<UnitResponse>("Không tìm thấy đơn vị tính."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UnitResponse>(entity)); }
    }

    public async Task<Result<UnitResponse>> Create(UnitRequest request)
    {
        const string loggingHeader = "Tạo đơn vị";
        var entity = _mapper.Map<Units>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IUnitRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<UnitResponse>(entity)); }
    }

    public async Task<Result<UnitResponse>> Update(int id, UnitRequest request)
    {
        const string loggingHeader = "Cập nhật đơn vị";
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy đơn vị tính.")}"); return NotFound<UnitResponse>("Không tìm thấy đơn vị tính."); }
        _mapper.Map(request, entity);
        _unitOfWork.IUnitRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<UnitResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa đơn vị";
        var entity = await _unitOfWork.IUnitRepository.FindFirst(x => x.UnitID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy đơn vị tính.")}"); return NotFound<bool>("Không tìm thấy đơn vị tính."); }
        _unitOfWork.IUnitRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa đơn vị tính thành công."); }
    }
}
