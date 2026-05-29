using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class RecurringConfigs
{
    [Key]
    public int BookingGroupID { get; set; } // PK & FK to BookingGroups
    public int CourtID { get; set; }
    public string DaysOfWeek { get; set; } = string.Empty; // "1,3,5" = Monday, Wednesday, Friday
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    // Navigation properties
    public BookingGroups? BookingGroup { get; set; }
    public Courts? Court { get; set; }
}
