using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

/// <summary>
/// Ghi lại toàn bộ thao tác Insert / Update / Delete trên DB.
/// </summary>
public class AuditLog
{
    [Key]
    public long AuditLogID { get; set; }

    /// <summary>Tên bảng bị tác động (e.g. "Bookings")</summary>
    public string TableName { get; set; } = string.Empty;

    /// <summary>INSERT | UPDATE | DELETE</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Primary key dạng chuỗi của bản ghi bị tác động</summary>
    public string RecordID { get; set; } = string.Empty;

    /// <summary>Dữ liệu trước khi thay đổi (JSON), null khi INSERT</summary>
    public string? OldValues { get; set; }

    /// <summary>Dữ liệu sau khi thay đổi (JSON), null khi DELETE</summary>
    public string? NewValues { get; set; }

    /// <summary>Danh sách cột bị thay đổi (JSON array), null khi INSERT/DELETE</summary>
    public string? AffectedColumns { get; set; }

    /// <summary>UserID hoặc "system" nếu thao tác tự động</summary>
    public string PerformedBy { get; set; } = "system";

    /// <summary>Địa chỉ IP của người thực hiện</summary>
    public string? IPAddress { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
