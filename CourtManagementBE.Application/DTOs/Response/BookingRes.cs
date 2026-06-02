using CourtManagementBE.Domain.Entities;
using System.Collections.Generic;

namespace CourtManagementBE.Application.DTOs;

public class BookingResponse
{
    public Guid BookingID { get; set; }
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public DateOnly BookingDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public int? CancellationReasonID { get; set; }
    public string CancellationReason { get; set; } = string.Empty;
    public DateTimeOffset CreatedDate { get; set; }

    public Courts Court { get; set; } = null!;
    public Customers Customer { get; set; } = null!;
    public BookingGroups? BookingGroup { get; set; }
    public BookingStatuses? CancellationReasonNavigation { get; set; }
    public ICollection<BookingSlots> BookingSlots { get; set; } = [];
    public ICollection<BookingServices> BookingServices { get; set; } = [];
    public ICollection<BookingCombos> BookingCombos { get; set; } = [];
}

