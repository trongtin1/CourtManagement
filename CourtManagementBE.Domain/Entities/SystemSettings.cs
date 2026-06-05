using System;
using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class SystemSettings
{
    [Key]
    public int ID { get; set; }
    public int SlotDurationMinutes { get; set; } = 60;
    public TimeSpan OpeningTime { get; set; } = new TimeSpan(6, 0, 0);
    public TimeSpan ClosingTime { get; set; } = new TimeSpan(22, 0, 0);
    public string Timezone { get; set; } = "Asia/Ho_Chi_Minh";
    
    // Cancellation Fee configurations
    public bool EnableCancellationFee { get; set; } = true;
    public decimal CancellationFeePercent { get; set; } = 20.0m;
    public double CancellationThresholdHours { get; set; } = 24.0;

    // Booking Constraints & Buffer configurations
    public int BufferDurationMinutes { get; set; } = 10;
    public int MinBookingDurationMinutes { get; set; } = 60;
    public int MaxBookingDurationMinutes { get; set; } = 180;
    public int MinAllowableGapMinutes { get; set; } = 60;

    // Booking & Deposit configurations
    public int MaxPreBookingDays { get; set; } = 14;
    public bool EnableDeposit { get; set; } = true;
    public int DepositPercent { get; set; } = 30;
}

