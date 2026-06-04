using System;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Extensions;

public static class SystemSettingsExtensions
{
    public static TimeZoneInfo GetTimeZoneInfo(this SystemSettings settings)
    {
        var timezoneId = settings?.Timezone ?? "Asia/Ho_Chi_Minh";
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
        }
        catch
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            catch
            {
                return TimeZoneInfo.Local;
            }
        }
    }

    public static DateTime GetLocalTime(this SystemSettings settings)
    {
        var zone = settings.GetTimeZoneInfo();
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zone);
    }

    public static DateTime ConvertToLocalTime(this SystemSettings settings, DateTime utcTime)
    {
        var zone = settings.GetTimeZoneInfo();
        var utc = utcTime.Kind == DateTimeKind.Utc ? utcTime : DateTime.SpecifyKind(utcTime, DateTimeKind.Utc);
        return TimeZoneInfo.ConvertTimeFromUtc(utc, zone);
    }
}
