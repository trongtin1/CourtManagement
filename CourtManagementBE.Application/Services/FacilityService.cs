using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class FacilityService : BaseService, IFacilityService
{
    private readonly ILogger<FacilityService> _logger;

    public FacilityService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<FacilityService> logger) : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<FacilityResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách cơ sở";
        var page = await _unitOfWork.IFacilityRepository.FindAll(
            x => _currentUser == null || _currentUser.IsSuperAdmin || x.FacilityID == _currentUser.FacilityId,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<Facilities, FacilityResponse>(page)); }
    }

    public async Task<Result<FacilityResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy cơ sở theo ID";
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cơ sở.")}"); return NotFound<FacilityResponse>("Không tìm thấy cơ sở."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền truy cập cơ sở này.")}"); return Unauthorized<FacilityResponse>("Bạn không có quyền truy cập cơ sở này."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<FacilityResponse>(entity)); }
    }

    public async Task<Result<FacilityResponse>> Create(FacilityRequest request)
    {
        const string loggingHeader = "Tạo cơ sở";
        if (_currentUser is { IsSuperAdmin: false })
        {
            { _logger.LogWarning($"{loggingHeader} - {("Chỉ Super Admin mới được tạo cơ sở.")}"); return Unauthorized<FacilityResponse>("Chỉ Super Admin mới được tạo cơ sở."); }
        }

        var entity = _mapper.Map<Facilities>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IFacilityRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<FacilityResponse>(entity)); }
    }

    public async Task<Result<FacilityResponse>> Update(int id, FacilityRequest request)
    {
        const string loggingHeader = "Cập nhật cơ sở";
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cơ sở.")}"); return NotFound<FacilityResponse>("Không tìm thấy cơ sở."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật cơ sở này.")}"); return Unauthorized<FacilityResponse>("Bạn không có quyền cập nhật cơ sở này."); }
        _mapper.Map(request, entity);
        _unitOfWork.IFacilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<FacilityResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa cơ sở";
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cơ sở.")}"); return NotFound<bool>("Không tìm thấy cơ sở."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền xóa cơ sở này.")}"); return Unauthorized<bool>("Bạn không có quyền xóa cơ sở này."); }
        _unitOfWork.IFacilityRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa cơ sở thành công."); }
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        const string loggingHeader = "Chuyển trạng thái kích hoạt cơ sở";
        var entity = await _unitOfWork.IFacilityRepository.FindFirst(x => x.FacilityID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy cơ sở.")}"); return NotFound<bool>("Không tìm thấy cơ sở."); }
        if (!CanAccessFacility(entity.FacilityID)) { _logger.LogWarning($"{loggingHeader} - {("Bạn không có quyền cập nhật cơ sở này.")}"); return Unauthorized<bool>("Bạn không có quyền cập nhật cơ sở này."); }
        entity.IsActive = !entity.IsActive;
        _unitOfWork.IFacilityRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, entity.IsActive ? "Kích hoạt thành công." : "Vô hiệu hóa thành công."); }
    }
}
