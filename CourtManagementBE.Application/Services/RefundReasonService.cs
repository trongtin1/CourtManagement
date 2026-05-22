using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class RefundReasonService : BaseService, IRefundReasonService
{
    public RefundReasonService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<PageList<RefundReasonResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IRefundReasonRepository.FindAll(
            _ => true,
            pagingSpecification: new PagingSpecification(query));
        return Success(MapPageList<RefundReasons, RefundReasonResponse>(page));
    }

    public async Task<Result<RefundReasonResponse>> GetById(int id)
    {
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) return NotFound<RefundReasonResponse>("Không tìm thấy lý do hoàn tiền.");
        return Success(_mapper.Map<RefundReasonResponse>(entity));
    }

    public async Task<Result<RefundReasonResponse>> Create(RefundReasonRequest request)
    {
        var entity = _mapper.Map<RefundReasons>(request);
        entity.CreatedDate = DateTimeOffset.UtcNow;
        await _unitOfWork.IRefundReasonRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return Created(_mapper.Map<RefundReasonResponse>(entity));
    }

    public async Task<Result<RefundReasonResponse>> Update(int id, RefundReasonRequest request)
    {
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) return NotFound<RefundReasonResponse>("Không tìm thấy lý do hoàn tiền.");
        _mapper.Map(request, entity);
        _unitOfWork.IRefundReasonRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<RefundReasonResponse>(entity));
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var entity = await _unitOfWork.IRefundReasonRepository.FindFirst(x => x.RefundReasonID == id);
        if (entity is null) return NotFound<bool>("Không tìm thấy lý do hoàn tiền.");
        _unitOfWork.IRefundReasonRepository.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa lý do hoàn tiền thành công.");
    }
}
