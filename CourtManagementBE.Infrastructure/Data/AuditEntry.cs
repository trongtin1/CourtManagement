using CourtManagementBE.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace CourtManagementBE.Infrastructure.Data;

/// <summary>
/// Helper nội bộ: thu thập thông tin thay đổi từ một EntityEntry
/// trước khi SaveChanges, sau đó convert sang AuditLog.
/// </summary>
internal sealed class AuditEntry
{
    public EntityEntry Entry { get; }
    public string TableName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = "system";
    public string? IPAddress { get; set; }

    public Dictionary<string, object?> OldValues { get; } = [];
    public Dictionary<string, object?> NewValues { get; } = [];
    public List<string> AffectedColumns { get; } = [];

    /// <summary>
    /// Tên & giá trị của các temporal property (e.g. cột GeneratedOnSave)
    /// — sẽ được điền sau khi SaveChanges chạy xong.
    /// </summary>
    public List<PropertyEntry> TemporaryProperties { get; } = [];

    public bool HasTemporaryProperties => TemporaryProperties.Count > 0;

    public AuditEntry(EntityEntry entry) => Entry = entry;

    public AuditLog ToAuditLog()
    {
        // Gộp các temporary property (PK auto-gen, cột DB-generated) vào NewValues
        foreach (var prop in TemporaryProperties)
        {
            if (prop.Metadata.IsPrimaryKey())
                NewValues[prop.Metadata.Name] = prop.CurrentValue;
            else
                NewValues[prop.Metadata.Name] = prop.CurrentValue;
        }

        // Lấy primary key của record
        var keyValues = Entry.Properties
            .Where(p => p.Metadata.IsPrimaryKey())
            .Select(p => p.CurrentValue?.ToString() ?? "");

        return new AuditLog
        {
            TableName = TableName,
            Action = Action,
            RecordID = string.Join(",", keyValues),
            OldValues = OldValues.Count > 0 ? JsonSerializer.Serialize(OldValues) : null,
            NewValues = NewValues.Count > 0 ? JsonSerializer.Serialize(NewValues) : null,
            AffectedColumns = AffectedColumns.Count > 0 ? JsonSerializer.Serialize(AffectedColumns) : null,
            PerformedBy = PerformedBy,
            IPAddress = IPAddress,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
