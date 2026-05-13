using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Payments
{
    [Key]
    public int PaymentID { get; set; }
    public Guid BookingID { get; set; }           // FK → Bookings.BookingID
    public decimal Amount { get; set; }
    public decimal RefundedAmount { get; set; } = 0;
    public string PaymentMethod { get; set; } = string.Empty;  // cash | bank_transfer | qr
    public string PaymentGateway { get; set; } = string.Empty; // VNPAY | MoMo | ZaloPay | Cash
    public string TransactionID { get; set; } = string.Empty;  // mã giao dịch từ cổng TT
    public string Status { get; set; } = string.Empty;         // pending | success | failed | refunded
    public string Note { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
}
