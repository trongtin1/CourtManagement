using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class PaymentRequest
{
    [Required] public Guid BookingID { get; set; }
    [Required] public decimal Amount { get; set; }
    public int? PaymentMethodID { get; set; }
    [Required, MaxLength(30)] public string PaymentMethod { get; set; } = string.Empty;
    [MaxLength(30)] public string PaymentGateway { get; set; } = string.Empty;
    [MaxLength(100)] public string TransactionID { get; set; } = string.Empty;
    public int? PaymentStatusID { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "pending";
    public int? RefundReasonID { get; set; }
    public decimal RefundedAmount { get; set; }
    [MaxLength(300)] public string Note { get; set; } = string.Empty;
    [Required] public DateTime PaymentDate { get; set; }
}

public class BookingPaymentRequest
{
    [Required] public decimal Amount { get; set; }
    [Required, MaxLength(30)] public string PaymentMethod { get; set; } = "cash";
    [MaxLength(300)] public string Note { get; set; } = string.Empty;
}
