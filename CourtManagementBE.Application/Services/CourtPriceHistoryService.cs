using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;

namespace CourtManagementBE.Application.Services;

public class CourtPriceHistoryService : BaseService, ICourtPriceHistoryService
{
    public CourtPriceHistoryService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<List<CourtPriceHistoryResponse>>> GetByCourt(int courtId)
    {
        if (!await CanAccessCourt(courtId)) return Unauthorized<List<CourtPriceHistoryResponse>>("Bạn không có quyền truy cập sân này.");
        var list = await _unitOfWork.ICourtPriceHistoryRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtPriceHistoryResponse>>(list));
    }

    public async Task<Result<List<CourtPriceHistoryResponse>>> GetByPriceSlot(int courtPriceByTimeSlotId)
    {
        var price = await _unitOfWork.ICourtPriceRepository.FindFirst(x => x.ID == courtPriceByTimeSlotId);
        if (price is null) return NotFound<List<CourtPriceHistoryResponse>>("Không tìm thấy giá sân.");
        if (!await CanAccessCourt(price.CourtID)) return Unauthorized<List<CourtPriceHistoryResponse>>("Bạn không có quyền truy cập lịch sử giá này.");

        var list = await _unitOfWork.ICourtPriceHistoryRepository.FindList(x => x.CourtPriceByTimeSlotID == courtPriceByTimeSlotId);
        return Success(_mapper.Map<List<CourtPriceHistoryResponse>>(list));
    }
}
