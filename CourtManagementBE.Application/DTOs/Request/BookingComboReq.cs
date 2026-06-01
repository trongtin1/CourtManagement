using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class BookingComboRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public int ComboID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "pending";
}

public class BookingComboBulkUpdateItemRequest
{
    [Required] public int BookingComboID { get; set; }
    public int ComboID { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "pending";
}

public class UpdateBookingComboRequest
{
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
    [MaxLength(20)] public string? Status { get; set; }
}
