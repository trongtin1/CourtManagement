using Microsoft.EntityFrameworkCore;
using CourtManagementBE.Infrastructure.Data;
using System.Text.RegularExpressions;

namespace CourtManagementBE.Infrastructure.Extensions.SqlExtentions;

public static class SqlScriptInitializer
{
    public static async Task RunSqlScriptsAsync(this IHost app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        var sqlDir = Path.Combine(Directory.GetCurrentDirectory(), "CourtManagementBE.Infrastructure", "SqlScripts");
        if (!Directory.Exists(sqlDir))
        {
            sqlDir = Path.Combine(AppContext.BaseDirectory, "SqlScripts");
        }

        if (!Directory.Exists(sqlDir))
        {
            logger.LogWarning("SqlScripts folder not found: {Path}", sqlDir);
            return;
        }

        var files = Directory.GetFiles(sqlDir, "*.sql")
                             .OrderBy(x => x)
                             .ToList();

        if (!files.Any())
        {
            return;
        }

        foreach (var file in files)
        {
            var fileName = Path.GetFileName(file);

            try
            {
                var sql = await File.ReadAllTextAsync(file);
                var batches = SplitByGo(sql);

                using var transaction = await db.Database.BeginTransactionAsync();

                foreach (var batch in batches)
                {
                    if (!string.IsNullOrWhiteSpace(batch))
                        await db.Database.ExecuteSqlRawAsync(batch);
                }

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error executing {File}", fileName);
            }
        }
    }

    private static IEnumerable<string> SplitByGo(string sql)
    {
        return Regex.Split(sql,
            @"^\s*GO\s*$",
            RegexOptions.Multiline | RegexOptions.IgnoreCase);
    }
}