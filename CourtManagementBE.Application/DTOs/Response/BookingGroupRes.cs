namespace CourtManagementBE.Application.DTOs;

public class BookingGroupResponse
{
    public int BookingGroupID { get; set; }
    public string GroupType { get; set; } = string.Empty;
    public int? CustomerID { get; set; }
    public int? FacilityID { get; set; }
    public int? ComboID { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; }

    public RecurringConfigResponse? RecurringConfig { get; set; }
}

public class RecurringConfigResponse
{
    public int BookingGroupID { get; set; }
    public int CourtID { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string DaysOfWeek { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
