using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;

namespace CourtManagementBE.Application.Services;

public class CourtPriceHistoryService : BaseService, ICourtPriceHistoryService
{
    public CourtPriceHistoryService(IUnitOfWork unitOfWork, IMapper mapper) : base(unitOfWork, mapper) { }

    public async Task<Result<List<CourtPriceHistoryResponse>>> GetByCourt(int courtId)
    {
        var list = await _unitOfWork.ICourtPriceHistoryRepository.FindList(x => x.CourtID == courtId);
        return Success(_mapper.Map<List<CourtPriceHistoryResponse>>(list));
    }

    public async Task<Result<List<CourtPriceHistoryResponse>>> GetByPriceSlot(int courtPriceByTimeSlotId)
    {
        var list = await _unitOfWork.ICourtPriceHistoryRepository.FindList(x => x.CourtPriceByTimeSlotID == courtPriceByTimeSlotId);
        return Success(_mapper.Map<List<CourtPriceHistoryResponse>>(list));
    }
}
