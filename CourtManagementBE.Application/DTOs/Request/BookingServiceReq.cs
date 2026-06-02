using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingServiceRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public int ServiceID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
}

public class BookingServiceBulkUpdateItemRequest
{
    // 0 or null means create new item in bulk update
    public int BookingServiceID { get; set; }
    [Required] public int ServiceID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
}

public class UpdateBookingServiceRequest
{
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
}
