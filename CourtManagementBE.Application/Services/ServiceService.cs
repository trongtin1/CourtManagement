using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class ServiceService : BaseService, IServiceService
{
    private readonly ILogger<ServiceService> _logger;

    public ServiceService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser, ILogger<ServiceService> logger)
        : base(unitOfWork, mapper, currentUser)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<ServiceResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách dịch vụ";
        var workingFacilityId = WorkingFacilityId;
        var page = await _unitOfWork.IServiceRepository.FindAll(
            x => x.FacilityID == null || workingFacilityId == null || x.FacilityID == workingFacilityId,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit),
            pagingSpecification: new PagingSpecification(query));

        _logger.LogInformation($"{loggingHeader} - Lấy danh sách dịch vụ thành công. WorkingFacilityId={workingFacilityId}, PageIndex={query.Page}, PageSize={query.PageSize}, SốLượng={page.Items.Count}");
        return Success(MapPageList<Domain.Entities.Services, ServiceResponse>(page));
    }

    public async Task<Result<ServiceResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy dịch vụ theo ID";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == id,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit));
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy dịch vụ. ServiceID={id}");
            return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền truy cập dịch vụ. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền truy cập dịch vụ này.");
        }

        _logger.LogInformation($"{loggingHeader} - Lấy dịch vụ thành công. ServiceID={entity.ServiceID}, ServiceName={entity.ServiceName}, FacilityID={entity.FacilityID}, IsActive={entity.IsActive}");
        return Success(_mapper.Map<ServiceResponse>(entity));
    }

    public async Task<Result<ServiceResponse>> Create(ServiceRequest request)
    {
        const string loggingHeader = "Tạo dịch vụ";
        request.FacilityID = WorkingFacilityId ?? request.FacilityID;
        if (request.FacilityID is not null && !CanAccessFacility(request.FacilityID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền tạo dịch vụ cho cơ sở. FacilityID={request.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền tạo dịch vụ cho cơ sở này.");
        }

        var entity = _mapper.Map<Domain.Entities.Services>(request);
        entity.CreateDate = DateTimeOffset.UtcNow;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        entity.Price = request.Price ?? 0;

        await _unitOfWork.IServiceRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == entity.ServiceID,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit));

        _logger.LogInformation($"{loggingHeader} - Tạo dịch vụ thành công. ServiceID={entity.ServiceID}, ServiceName={entity.ServiceName}, FacilityID={entity.FacilityID}, Price={entity.Price}, IsTrackStock={entity.IsTrackStock}");
        return Created(_mapper.Map<ServiceResponse>(created!));
    }

    public async Task<Result<ServiceResponse>> Update(int id, ServiceRequest request)
    {
        const string loggingHeader = "Cập nhật dịch vụ";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy dịch vụ. ServiceID={id}");
            return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền cập nhật dịch vụ. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền cập nhật dịch vụ này.");
        }

        request.FacilityID = WorkingFacilityId ?? request.FacilityID ?? entity.FacilityID;
        if (request.FacilityID is not null && !CanAccessFacility(request.FacilityID.Value))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền chuyển dịch vụ sang cơ sở khác. ServiceID={id}, FacilityID={request.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền chuyển dịch vụ sang cơ sở này.");
        }

        _mapper.Map(request, entity);
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        if (request.Price.HasValue)
        {
            entity.Price = request.Price.Value;
        }

        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == entity.ServiceID,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit));

        _logger.LogInformation($"{loggingHeader} - Cập nhật dịch vụ thành công. ServiceID={entity.ServiceID}, ServiceName={entity.ServiceName}, FacilityID={entity.FacilityID}, Price={entity.Price}, IsActive={entity.IsActive}");
        return Success(_mapper.Map<ServiceResponse>(updated!));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa dịch vụ";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == id,
            include: q => q.Include(x => x.BaseUnit));
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy dịch vụ. ServiceID={id}");
            return NotFound<bool>("Không tìm thấy dịch vụ.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền xóa dịch vụ. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<bool>("Bạn không có quyền xóa dịch vụ này.");
        }
        _unitOfWork.IServiceRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Xóa dịch vụ thành công. ServiceID={id}, ServiceName={entity.ServiceName}, FacilityID={entity.FacilityID}");
        return Success(true, "Xóa dịch vụ thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        const string loggingHeader = "Chuyển trạng thái kích hoạt dịch vụ";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy dịch vụ. ServiceID={id}");
            return NotFound<bool>("Không tìm thấy dịch vụ.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền cập nhật dịch vụ. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<bool>("Bạn không có quyền cập nhật dịch vụ này.");
        }
        entity.IsActive = !entity.IsActive;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Cập nhật trạng thái dịch vụ thành công. ServiceID={id}, ServiceName={entity.ServiceName}, IsActive={entity.IsActive}");
        return Success(true, entity.IsActive ? "Kích hoạt thành công." : "Vô hiệu hóa thành công.");
    }

    public async Task<Result<ServiceResponse>> DeductStock(int id, int quantity)
    {
        const string loggingHeader = "Trừ tồn kho dịch vụ";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(x => x.ServiceID == id);
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy dịch vụ. ServiceID={id}, Quantity={quantity}");
            return NotFound<ServiceResponse>("Không tìm thấy dịch vụ.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền thao tác dịch vụ. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền thao tác dịch vụ này.");
        }
        if (!entity.IsTrackStock)
        {
            _logger.LogWarning($"{loggingHeader} - Dịch vụ không cấu hình theo dõi tồn kho. ServiceID={id}, ServiceName={entity.ServiceName}");
            return BadRequest<ServiceResponse>("Dịch vụ này không cấu hình theo dõi tồn kho.");
        }

        if (entity.StockQuantity < quantity)
        {
            _logger.LogWarning($"{loggingHeader} - Không đủ tồn kho. ServiceID={id}, ServiceName={entity.ServiceName}, Quantity={quantity}, StockQuantity={entity.StockQuantity}");
            return BadRequest<ServiceResponse>($"Sản phẩm '{entity.ServiceName}' không đủ tồn kho (Hiện còn: {entity.StockQuantity}).");
        }

        entity.StockQuantity -= quantity;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Trừ tồn kho thành công. ServiceID={id}, ServiceName={entity.ServiceName}, Quantity={quantity}, StockQuantity={entity.StockQuantity}");
        return Success(_mapper.Map<ServiceResponse>(entity), $"Trừ kho thành công. Tồn kho mới: {entity.StockQuantity}");
    }

    public async Task<Result<ServiceResponse>> HandoutRental(int id, int quantity)
    {
        const string loggingHeader = "Giao thiết bị cho thuê";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == id,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit));
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy thiết bị cho thuê. ServiceID={id}, Quantity={quantity}");
            return NotFound<ServiceResponse>("Không tìm thấy thiết bị cho thuê.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền thao tác thiết bị. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền thao tác thiết bị này.");
        }
        if (entity.ServiceType?.Code != "rental")
        {
            _logger.LogWarning($"{loggingHeader} - Dịch vụ không phải loại cho thuê. ServiceID={id}, ServiceType={entity.ServiceType?.Code}");
            return BadRequest<ServiceResponse>("Dịch vụ này không phải là loại cho thuê thiết bị.");
        }

        if (entity.StockQuantity < quantity)
        {
            _logger.LogWarning($"{loggingHeader} - Không đủ thiết bị khả dụng. ServiceID={id}, ServiceName={entity.ServiceName}, Quantity={quantity}, StockQuantity={entity.StockQuantity}");
            return BadRequest<ServiceResponse>($"Không đủ thiết bị '{entity.ServiceName}' khả dụng trong tủ để cho thuê (Còn: {entity.StockQuantity}).");
        }

        entity.StockQuantity -= quantity;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Giao thiết bị thành công. ServiceID={id}, ServiceName={entity.ServiceName}, Quantity={quantity}, StockQuantity={entity.StockQuantity}");
        return Success(_mapper.Map<ServiceResponse>(entity), $"Giao đồ cho thuê thành công. Khả dụng còn lại: {entity.StockQuantity}");
    }

    public async Task<Result<ServiceResponse>> ReturnRental(int id, int quantity)
    {
        const string loggingHeader = "Nhận lại thiết bị cho thuê";
        var entity = await _unitOfWork.IServiceRepository.FindFirst(
            x => x.ServiceID == id,
            include: q => q.Include(x => x.ServiceType).Include(x => x.BaseUnit));
        if (entity is null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy thiết bị cho thuê. ServiceID={id}, Quantity={quantity}");
            return NotFound<ServiceResponse>("Không tìm thấy thiết bị cho thuê.");
        }
        if (!CanAccessService(entity))
        {
            _logger.LogWarning($"{loggingHeader} - Không có quyền thao tác thiết bị. ServiceID={id}, FacilityID={entity.FacilityID}, UserID={_currentUser?.UserId}");
            return Unauthorized<ServiceResponse>("Bạn không có quyền thao tác thiết bị này.");
        }
        if (entity.ServiceType?.Code != "rental")
        {
            _logger.LogWarning($"{loggingHeader} - Dịch vụ không phải loại cho thuê. ServiceID={id}, ServiceType={entity.ServiceType?.Code}");
            return BadRequest<ServiceResponse>("Dịch vụ này không phải là loại cho thuê thiết bị.");
        }

        entity.StockQuantity += quantity;
        entity.ModifiedDate = DateTimeOffset.UtcNow;
        _unitOfWork.IServiceRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Nhận lại thiết bị thành công. ServiceID={id}, ServiceName={entity.ServiceName}, Quantity={quantity}, StockQuantity={entity.StockQuantity}");
        return Success(_mapper.Map<ServiceResponse>(entity), $"Nhận lại đồ khách trả thành công. Khả dụng hiện tại: {entity.StockQuantity}");
    }

    private bool CanAccessService(Domain.Entities.Services service)
        => service.FacilityID is null || CanAccessFacility(service.FacilityID.Value);

}
