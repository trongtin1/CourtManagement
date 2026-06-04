using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.Common;

namespace CourtManagementBE.Application.IServices;

public interface ISystemSettingsService
{
    Task<Result<SystemSettingsDto>> GetSettings();
    Task<Result<SystemSettingsDto>> UpdateSettings(SystemSettingsDto dto);
}
