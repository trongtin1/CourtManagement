using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class ServiceService : BaseService, IServiceService
{
    public ServiceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<ServiceResponse>>> GetAll(QueryResource query)
    {
        var workingFacilityId = WorkingFacilityId;
        var now = DateTimeOffset.UtcNow;
        var page = await _unitOfWork.IServiceRepository.FindAll(
            x => x.FacilityID == null || workingFacilityId == null || x.FacilityID == workingFacilityId,
            include: q => q.Include(x => x.ServicePrices
                .Where(p => p.EffectiveDate <= now && (p.ExpiryDate == null || p.ExpiryDate > now))),
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<Domain.Entities.Services, ServiceResponse>(page));
    }

    public async Task<Result<ServiceResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == id,
            include: q => q.Include(x => x.ServicePrices));
        if (entity is null) return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        if (!CanAccessService(entity)) return Unauthorized<ServiceResponse>("Bạn không có quyền truy cập dịch vụ này.");
        return Success(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<ServiceResponse>> Create(ServiceRequest request)
    {
        request.FacilityID = WorkingFacilityId ?? request.FacilityID;
        if (request.FacilityID is not null && !CanAccessFacility(request.FacilityID.Value))
        {
            return Unauthorized<ServiceResponse>("Bạn không có quyền tạo dịch vụ cho cơ sở này.");
        }

        var entity = _mapper.Map<Domain.Entities.Services>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<ServiceResponse>> Update(int id, ServiceRequest request)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        if (!CanAccessService(entity)) return Unauthorized<ServiceResponse>("Bạn không có quyền cập nhật dịch vụ này.");

        request.FacilityID = WorkingFacilityId ?? request.FacilityID ?? entity.FacilityID;
        if (request.FacilityID is not null && !CanAccessFacility(request.FacilityID.Value))
        {
            return Unauthorized<ServiceResponse>("Bạn không có quyền chuyển dịch vụ sang cơ sở này.");
        }

        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ.");
        if (!CanAccessService(entity)) return Unauthorized<bool>("Bạn không có quyền xóa dịch vụ này.");
        _unitOfWork.IServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa dịch vụ thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy dịch vụ.");
        if (!CanAccessService(entity)) return Unauthorized<bool>("Bạn không có quyền cập nhật dịch vụ này.");
        entity.IsActive = !entity.IsActive;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, entity.IsActive ? "Kích hoạt thành công." : "Vô hiệu hóa thành công.");
    }

    private bool CanAccessService(Domain.Entities.Services service)
        => service.FacilityID is null || CanAccessFacility(service.FacilityID.Value);

}
