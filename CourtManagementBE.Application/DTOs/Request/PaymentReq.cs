using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class PaymentRequest
{
    public Guid? BookingID { get; set; }
    public int? BookingGroupID { get; set; }
    [Required] public decimal Amount { get; set; }
    [Required, MaxLength(30)] public string PaymentMethod { get; set; } = string.Empty;
    [Required, MaxLength(20)] public string Status { get; set; } = "success";
    public decimal RefundedAmount { get; set; }
    [MaxLength(300)] public string Note { get; set; } = string.Empty;
    [Required] public DateTime PaymentDate { get; set; }
}

public class BookingPaymentRequest
{
    [Required] public decimal Amount { get; set; }
    [MaxLength(300)] public string Note { get; set; } = string.Empty;
}

public class BookingRefundRequest
{
    [Required] public decimal Amount { get; set; }
    [MaxLength(300)] public string Note { get; set; } = string.Empty;
}

