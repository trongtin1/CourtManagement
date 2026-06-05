using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class CourtTypeService : BaseService, ICourtTypeService
{
    private readonly ILogger<CourtTypeService> _logger;

    public CourtTypeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CourtTypeService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<PageList<CourtTypeResponse>>> GetAll(QueryResource query)
    {
        const string loggingHeader = "Lấy danh sách loại sân";
        var page = await _unitOfWork.ICourtTypeRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(MapPageList<CourtTypes, CourtTypeResponse>(page)); }
    }

    public async Task<Result<CourtTypeResponse>> GetById(int id)
    {
        const string loggingHeader = "Lấy loại sân theo ID";
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại sân.")}"); return NotFound<CourtTypeResponse>("Không tìm thấy loại sân."); }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtTypeResponse>(entity)); }
    }

    public async Task<Result<CourtTypeResponse>> Create(CourtTypeRequest request)
    {
        const string loggingHeader = "Tạo loại sân";
        var entity = _mapper.Map<CourtTypes>(request);
        await _unitOfWork.ICourtTypeRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Created(_mapper.Map<CourtTypeResponse>(entity)); }
    }

    public async Task<Result<CourtTypeResponse>> Update(int id, CourtTypeRequest request)
    {
        const string loggingHeader = "Cập nhật loại sân";
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại sân.")}"); return NotFound<CourtTypeResponse>("Không tìm thấy loại sân."); }
        _mapper.Map(request, entity);
        _unitOfWork.ICourtTypeRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<CourtTypeResponse>(entity)); }
    }

    public async Task<Result<bool>> Delete(int id)
    {
        const string loggingHeader = "Xóa loại sân";
        var entity = await _unitOfWork.ICourtTypeRepository.FindFirst(x => x.CourtTypeID == id);
        if (entity is null) { _logger.LogWarning($"{loggingHeader} - {("Không tìm thấy loại sân.")}"); return NotFound<bool>("Không tìm thấy loại sân."); }
        _unitOfWork.ICourtTypeRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(true, "Xóa loại sân thành công."); }
    }
}
