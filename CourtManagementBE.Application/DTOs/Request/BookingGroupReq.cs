using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingGroupRequest
{
    [Required, MaxLength(30)] public string GroupType { get; set; } = "recurring"; // recurring | tournament | corporate
    public int? CustomerID { get; set; }
    public int? FacilityID { get; set; }
    public int? ComboID { get; set; }
    [Required, MaxLength(200)] public string GroupName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "active"; // active | paused | cancelled | completed
    [MaxLength(500)] public string Note { get; set; } = string.Empty;

    // Cấu hình lặp lại nếu GroupType == "recurring"
    public RecurringConfigRequest? RecurringConfig { get; set; }
}

public class RecurringConfigRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public DateOnly StartDate { get; set; }
    [Required] public DateOnly EndDate { get; set; }
    [MaxLength(20)] public string DaysOfWeek { get; set; } = string.Empty; // "1,3,5" = T2,T4,T6
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
