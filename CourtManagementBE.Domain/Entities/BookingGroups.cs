using System.ComponentModel.DataAnnotations;

using CourtManagementBE.Domain.Enums;

namespace CourtManagementBE.Domain.Entities;

public class BookingGroups
{
    [Key]
    public int BookingGroupID { get; set; }
    public string GroupType { get; set; } = string.Empty; // recurring | tournament | corporate
    public int? CustomerID { get; set; }
    public int? FacilityID { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public BookingGroupStatus Status { get; set; } = BookingGroupStatus.Active;
    public string Note { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;

    // Navigation properties
    public Customers? Customer { get; set; }
    public Facilities? Facility { get; set; }
    public RecurringConfigs? RecurringConfig { get; set; }
}
