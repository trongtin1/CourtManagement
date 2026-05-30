using System.ComponentModel.DataAnnotations;

using CourtManagementBE.Domain.Enums;

namespace CourtManagementBE.Domain.Entities;

public class Bookings
{
    [Key]
    public Guid BookingID { get; set; } = Guid.NewGuid();
    public int CourtID { get; set; }
    public int CustomerID { get; set; }
    public DateTime BookingDate { get; set; }

    // 🆕 Giờ bắt đầu/kết thúc trực tiếp tại Booking để tối ưu hiệu năng
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0;

    // 🛠️ Trạng thái (Sử dụng Enum strongly-typed để đảm bảo an toàn nghiệp vụ)
    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    // 🛠️ Lý do hủy (Master Data phân loại + Ghi chú chi tiết cho buổi hủy đó)
    public int? CancellationReasonID { get; set; }
    public string CancellationReason { get; set; } = string.Empty; // Chi tiết lý do hủy của khách hàng

    public int? ComboID { get; set; } // Combo dịch vụ áp dụng cho buổi này
    public int? BookingGroupID { get; set; } // FK tới BookingGroups (null nếu đặt lẻ)

    public string Note { get; set; } = string.Empty;
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset ModifiedDate { get; set; } = DateTimeOffset.UtcNow;
    public string ModifiedBy { get; set; } = string.Empty;

    // Navigation properties
    public BookingGroups? BookingGroup { get; set; }
    public CancellationReasons? CancellationReasonNavigation { get; set; } // Đổi tên navigation tránh trùng với string property
    public Combos? Combo { get; set; }
    public Courts? Court { get; set; }
    public Customers? Customer { get; set; }
}
