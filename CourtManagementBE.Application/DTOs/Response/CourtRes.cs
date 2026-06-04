namespace CourtManagementBE.Application.DTOs;

public class CourtResponse
{
    public int CourtID { get; set; }
    public int FacilityID { get; set; }
    public int CourtTypeID { get; set; }
    public string CourtCode { get; set; } = string.Empty;
    public string CourtName { get; set; } = string.Empty;
    public int StatusID { get; set; }
    public float Length { get; set; }
    public float Width { get; set; }
    public int Capacity { get; set; }
    public int SortOrder { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageURL { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}

public class CourtSlotAvailabilityResponse
{
    public int SlotIndex { get; set; }
    public string SlotName { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsLocked { get; set; }
    public bool IsBooked { get; set; }
    public string? LockReason { get; set; }
}

public class CourtTimelineAvailabilityResponse
{
    public int CourtID { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public string CourtCode { get; set; } = string.Empty;
    public string CourtType { get; set; } = string.Empty;
    public List<TimelineBookingResponse> Bookings { get; set; } = new();
    public List<TimelineLockResponse> Locks { get; set; } = new();
    public List<TimelineAvailableSlotResponse> AvailableSlots { get; set; } = new();
}

public class TimelineAvailableSlotResponse
{
    public int TimeSlotID { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class TimelineBookingResponse
{
    public string BookingID { get; set; } = string.Empty;
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public string BookingDate { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public TimelineCustomerResponse? Customer { get; set; }
    public List<TimelineBookingSlotResponse> Slots { get; set; } = new();
}

public class TimelineBookingSlotResponse
{
    public int TimeSlotID { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class TimelineLockResponse
{
    public int CourtID { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
}

public class TimelineCustomerResponse
{
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CustomerType { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class CourtWeeklyTimelineResponse
{
    public int BufferDurationMinutes { get; set; }
    public List<CourtDailyTimelineResponse> Timeline { get; set; } = new();
}

public class CourtDailyTimelineResponse
{
    public int DayOfWeek { get; set; }
    public string Date { get; set; } = string.Empty;
    public List<WeeklyBookingResponse> Bookings { get; set; } = new();
    public List<WeeklyLockResponse> Locks { get; set; } = new();
    public List<WeeklyPriceRuleResponse> PriceRules { get; set; } = new();
}

public class WeeklyBookingResponse
{
    public Guid BookingID { get; set; }
    public int CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public BookingBufferResponse? TimeBuffer { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}

public class BookingBufferResponse
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

public class WeeklyLockResponse
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class WeeklyPriceRuleResponse
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public decimal Price { get; set; }
}




