using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingComboRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public int ComboID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
}

public class BookingComboBulkUpdateItemRequest
{
    [Required, Range(1, int.MaxValue)] public int BookingComboID { get; set; }
    public int ComboID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
}

public class UpdateBookingComboRequest
{
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
}
