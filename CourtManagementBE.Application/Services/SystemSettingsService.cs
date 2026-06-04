using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Services;

public class SystemSettingsService : BaseService, ISystemSettingsService
{
    public SystemSettingsService(IUnitOfWork unitOfWork, IMapper mapper)
        : base(unitOfWork, mapper) { }

    public async Task<Result<SystemSettingsDto>> GetSettings()
    {
        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1);
        if (settings == null)
        {
            settings = new SystemSettings();
            await _unitOfWork.ISystemSettingsRepository.Add(settings);
            await _unitOfWork.SaveChangesAsync();
        }
        return Success(_mapper.Map<SystemSettingsDto>(settings));
    }

    public async Task<Result<SystemSettingsDto>> UpdateSettings(SystemSettingsDto dto)
    {
        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1);
        if (settings == null)
        {
            settings = new SystemSettings();
            _mapper.Map(dto, settings);
            await _unitOfWork.ISystemSettingsRepository.Add(settings);
        }
        else
        {
            _mapper.Map(dto, settings);
            _unitOfWork.ISystemSettingsRepository.Update(settings);
        }
        await _unitOfWork.SaveChangesAsync();
        return Success(_mapper.Map<SystemSettingsDto>(settings));
    }
}
