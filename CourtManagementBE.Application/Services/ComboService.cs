using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Application.Services;

public class ComboService : BaseService, IComboService
{
    public ComboService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : base(unitOfWork, mapper, currentUser) { }

    public async Task<Result<PageList<ComboResponse>>> GetAll(QueryResource query)
    {
        var page = await _unitOfWork.IComboRepository.FindAll(
            x => true,
            pagingSpecification: new PagingSpecification(query)
        );

        var responses = new List<ComboResponse>();
        foreach (var item in page.Items)
        {
            var res = _mapper.Map<ComboResponse>(item);
            var services = await _unitOfWork.IComboServiceRepository.FindList(
                x => x.ComboID == item.ComboID,
                include: q => q.Include(cs => cs.Service)
            );
            res.Services = services.Select(x => new ComboServiceResponse
            {
                ServiceID = x.ServiceID,
                ServiceName = x.Service?.ServiceName ?? string.Empty,
                ServiceCode = x.Service?.ServiceCode ?? string.Empty,
                Unit = x.Service?.Unit ?? string.Empty,
                Quantity = x.Quantity
            }).ToList();
            responses.Add(res);
        }

        var resultPage = new PageList<ComboResponse>(responses, page.TotalCount, page.Page, page.PageSize);
        return Success(resultPage);
    }

    public async Task<Result<ComboResponse>> GetById(int id)
    {
        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == id);
        if (combo is null) return NotFound<ComboResponse>("Không tìm thấy combo.");

        var services = await _unitOfWork.IComboServiceRepository.FindList(
            x => x.ComboID == combo.ComboID,
            include: q => q.Include(cs => cs.Service)
        );

        var res = _mapper.Map<ComboResponse>(combo);
        res.Services = services.Select(x => new ComboServiceResponse
        {
            ServiceID = x.ServiceID,
            ServiceName = x.Service?.ServiceName ?? string.Empty,
            ServiceCode = x.Service?.ServiceCode ?? string.Empty,
            Unit = x.Service?.Unit ?? string.Empty,
            Quantity = x.Quantity
        }).ToList();

        return Success(res);
    }

    public async Task<Result<ComboResponse>> Create(ComboRequest request)
    {
        var existing = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboCode == request.ComboCode);
        if (existing is not null)
        {
            return BadRequest<ComboResponse>("Mã combo đã tồn tại.");
        }

        var combo = _mapper.Map<Combos>(request);
        combo.CreatedDate = DateTimeOffset.UtcNow;

        await _unitOfWork.IComboRepository.Add(combo);
        await _unitOfWork.SaveChangesAsync();

        if (request.Services is not null && request.Services.Any())
        {
            var comboServices = request.Services.Select(x => new ComboServices
            {
                ComboID = combo.ComboID,
                ServiceID = x.ServiceID,
                Quantity = x.Quantity
            }).ToList();

            await _unitOfWork.IComboServiceRepository.AddRange(comboServices);
            await _unitOfWork.SaveChangesAsync();
        }

        return await GetById(combo.ComboID);
    }

    public async Task<Result<ComboResponse>> Update(int id, ComboRequest request)
    {
        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == id);
        if (combo is null) return NotFound<ComboResponse>("Không tìm thấy combo.");

        var existing = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboCode == request.ComboCode && x.ComboID != id);
        if (existing is not null)
        {
            return BadRequest<ComboResponse>("Mã combo đã tồn tại.");
        }

        _mapper.Map(request, combo);
        _unitOfWork.IComboRepository.Update(combo);

        await _unitOfWork.IComboServiceRepository.RemoveWithPredicate(x => x.ComboID == id);

        if (request.Services is not null && request.Services.Any())
        {
            var comboServices = request.Services.Select(x => new ComboServices
            {
                ComboID = combo.ComboID,
                ServiceID = x.ServiceID,
                Quantity = x.Quantity
            }).ToList();

            await _unitOfWork.IComboServiceRepository.AddRange(comboServices);
        }

        await _unitOfWork.SaveChangesAsync();
        return await GetById(combo.ComboID);
    }

    public async Task<Result<bool>> Delete(int id)
    {
        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == id);
        if (combo is null) return NotFound<bool>("Không tìm thấy combo.");

        _unitOfWork.IComboRepository.Remove(combo);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, "Xóa combo thành công.");
    }

    public async Task<Result<bool>> ToggleActive(int id)
    {
        var combo = await _unitOfWork.IComboRepository.FindFirst(x => x.ComboID == id);
        if (combo is null) return NotFound<bool>("Không tìm thấy combo.");

        combo.IsActive = !combo.IsActive;
        _unitOfWork.IComboRepository.Update(combo);
        await _unitOfWork.SaveChangesAsync();
        return Success(true, combo.IsActive ? "Kích hoạt combo thành công." : "Vô hiệu hóa combo thành công.");
    }
}
