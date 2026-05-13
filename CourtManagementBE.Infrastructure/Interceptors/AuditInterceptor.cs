using System.Collections.Concurrent;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Infrastructure.Extensions.HttpContextExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CourtManagementBE.Infrastructure.Data.Interceptors;

/// <summary>
/// EF Core SaveChanges Interceptor — tự động ghi AuditLog cho mọi INSERT/UPDATE/DELETE.
/// Đăng ký Scoped để inject được IHttpContextHelper (scoped).
/// </summary>
public sealed class AuditInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextHelper _httpContextHelper;

    // Lưu các entry có PK auto-gen (chưa có giá trị trước khi SaveChanges hoàn tất)
    // Key = DbContext instance — mỗi scope có 1 context riêng nên không conflict
    private readonly ConcurrentDictionary<DbContext, List<AuditEntry>> _pendingEntries = new();

    public AuditInterceptor(IHttpContextHelper httpContextHelper)
        => _httpContextHelper = httpContextHelper;

    // ── Sync overrides ────────────────────────────────────────────────────────

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
            Collect(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override int SavedChanges(
        SaveChangesCompletedEventData eventData, int result)
    {
        if (eventData.Context is not null)
            WritePending(eventData.Context).GetAwaiter().GetResult();

        return base.SavedChanges(eventData, result);
    }

    // ── Async overrides ───────────────────────────────────────────────────────

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            Collect(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            await WritePending(eventData.Context, cancellationToken);

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    // ── Core logic ────────────────────────────────────────────────────────────

    /// <summary>
    /// Thu thập thay đổi từ ChangeTracker trước khi SaveChanges thực thi.
    /// - Entry không có PK tạm → ghi thẳng vào Set[AuditLog] (lưu cùng đợt chính).
    /// - Entry có PK tạm (auto-increment chưa sinh) → lưu vào _pendingEntries,
    ///   xử lý sau trong SavedChanges khi PK đã có giá trị thật.
    /// </summary>
    private void Collect(DbContext context)
    {
        context.ChangeTracker.DetectChanges();

        var ready   = new List<AuditLog>();
        var pending = new List<AuditEntry>();

        var userId = _httpContextHelper.GetCurrentUserEmail();
        var ip     = _httpContextHelper.GetCurrentIp();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Bỏ qua AuditLog và các state không thay đổi
            if (entry.Entity is AuditLog
                || entry.State is EntityState.Detached or EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                TableName   = entry.Metadata.GetTableName() ?? entry.Metadata.ShortName(),
                Action      = entry.State switch
                {
                    EntityState.Added    => "INSERT",
                    EntityState.Modified => "UPDATE",
                    EntityState.Deleted  => "DELETE",
                    _                    => "UNKNOWN"
                },
                PerformedBy = userId,
                IPAddress   = ip
            };

            foreach (var prop in entry.Properties)
            {
                if (prop.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(prop);
                    continue;
                }

                var name = prop.Metadata.Name;
                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[name] = prop.CurrentValue;
                        break;
                    case EntityState.Deleted:
                        auditEntry.OldValues[name] = prop.OriginalValue;
                        break;
                    case EntityState.Modified when prop.IsModified:
                        auditEntry.AffectedColumns.Add(name);
                        auditEntry.OldValues[name] = prop.OriginalValue;
                        auditEntry.NewValues[name]  = prop.CurrentValue;
                        break;
                }
            }

            if (auditEntry.HasTemporaryProperties)
                pending.Add(auditEntry);   // cần chờ PK được sinh
            else
                ready.Add(auditEntry.ToAuditLog()); // PK đã có, ghi luôn
        }

        if (ready.Count > 0)
            context.Set<AuditLog>().AddRange(ready);

        if (pending.Count > 0)
            _pendingEntries[context] = pending;
    }

    /// <summary>
    /// Sau SaveChanges hoàn tất, PK auto-gen đã có giá trị thật.
    /// Ghi nốt các AuditLog còn lại trong một lần save riêng.
    /// Lần này ChangeTracker chỉ thấy AuditLog → Collect() bỏ qua → không đệ quy vô hạn.
    /// </summary>
    private async Task WritePending(DbContext context, CancellationToken ct = default)
    {
        if (!_pendingEntries.TryRemove(context, out var pending) || pending.Count == 0)
            return;

        context.Set<AuditLog>().AddRange(pending.Select(e => e.ToAuditLog()));
        await context.SaveChangesAsync(ct);
    }
}
