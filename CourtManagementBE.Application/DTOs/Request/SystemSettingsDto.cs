using System;

namespace CourtManagementBE.Application.DTOs;

public class SystemSettingsDto
{
    public int SlotDurationMinutes { get; set; }
    public TimeSpan OpeningTime { get; set; }
    public TimeSpan ClosingTime { get; set; }
    public string Timezone { get; set; } = string.Empty;
    public bool EnableCancellationFee { get; set; }
    public decimal CancellationFeePercent { get; set; }
    public double CancellationThresholdHours { get; set; }

    public int BufferDurationMinutes { get; set; }
    public int MinBookingDurationMinutes { get; set; }
    public int MaxBookingDurationMinutes { get; set; }
    public int MinAllowableGapMinutes { get; set; }

    public int MaxPreBookingDays { get; set; }
    public bool EnableDeposit { get; set; }
    public int DepositPercent { get; set; }
}
