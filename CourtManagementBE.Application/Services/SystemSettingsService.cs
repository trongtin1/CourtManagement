using AutoMapper;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

using Microsoft.Extensions.Logging;
namespace CourtManagementBE.Application.Services;

public class SystemSettingsService : BaseService, ISystemSettingsService
{
    private readonly ILogger<SystemSettingsService> _logger;

    public SystemSettingsService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<SystemSettingsService> logger) : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<SystemSettingsDto>> GetSettings()
    {
        const string loggingHeader = "Thực hiện Get Settings cấu hình hệ thống";
        var settings = await _unitOfWork.ISystemSettingsRepository.FindFirst(x => x.ID == 1);
        if (settings == null)
        {
            settings = new SystemSettings();
            await _unitOfWork.ISystemSettingsRepository.Add(settings);
            await _unitOfWork.SaveChangesAsync();
        }
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<SystemSettingsDto>(settings)); }
    }

    public async Task<Result<SystemSettingsDto>> UpdateSettings(SystemSettingsDto dto)
    {
        const string loggingHeader = "Thực hiện Update Settings cấu hình hệ thống";
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
        { _logger.LogInformation($"{loggingHeader} - Thành công."); return Success(_mapper.Map<SystemSettingsDto>(settings)); }
    }
}
