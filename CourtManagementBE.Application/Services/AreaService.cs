using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class AreaService : BaseService, IAreaService
{
    private readonly ILogger<AreaService> _logger;

    public AreaService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<AreaService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<AreaResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách khu vực";
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.IAreaRepository.FindAll(
            x => workingFacilityId == null || x.FacilityID == workingFacilityId,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<Areas, AreaResponse>(page)); }
    }

    public async Task<Result<List<AreaResponse>>> GetByFacility(int facilityId)
    {
        const string loggingHeader = "Lấy khu vực theo cơ sở";
        if (!CanAccessFacility(facilityId)) return Unauthorized<List<AreaResponse>>("Bạn không có quyền truy cập cơ sở này.");
        var list = await _unitOfWork.IAreaRepository.FindList(x => x.FacilityID == facilityId);
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<List<AreaResponse>>(list)); }
    }

    public async Task<Result<AreaResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy khu vực theo ID";
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy khu vực.")}"); return NotFound<AreaResponse>("Không tìm thấy khu vực."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập khu vực này.")}"); return Unauthorized<AreaResponse>("Bạn không có quyền truy cập khu vực này."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AreaResponse>(entity)); }
    }

    public async Task<Result<AreaResponse>> Create(AreaRequest request)
    {
        const string loggingHeader = "Tạo khu vực";
        var facilityId = WorkingFacilityId ?? request.FacilityID;
        if (!CanAccessFacility(facilityId)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền tạo khu vực cho cơ sở này.")}"); return Unauthorized<AreaResponse>("Bạn không có quyền tạo khu vực cho cơ sở này."); }

        request.FacilityID = facilityId;
        var entity = _mapper.Map<Areas>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IAreaRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<AreaResponse>(entity)); }
    }

    public async Task<Result<AreaResponse>> Update(int id, AreaRequest request)
    {
        const string loggingHeader = "Cập nhật khu vực";
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy khu vực.")}"); return NotFound<AreaResponse>("Không tìm thấy khu vực."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật khu vực này.")}"); return Unauthorized<AreaResponse>("Bạn không có quyền cập nhật khu vực này."); }
        _mapper.Map(request, entity);
        _unitOfWork.IAreaRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<AreaResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa khu vực";
        var entity = await _unitOfWork.IAreaRepository.FindFirst(x => x.AreaID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy khu vực.")}"); return NotFound<bool>("Không tìm thấy khu vực."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa khu vực này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa khu vực này."); }
        _unitOfWork.IAreaRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa khu vực thành công."); }
    }
}
