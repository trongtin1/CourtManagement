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

        var currentDir = Directory.GetCurrentDirectory();
        var candidatePaths = new[]
        {
            Path.Combine(currentDir, "CourtManagementBE.Infrastructure", "SqlScripts"),
            Path.Combine(currentDir, "..", "CourtManagementBE.Infrastructure", "SqlScripts"),
            Path.Combine(AppContext.BaseDirectory, "SqlScripts"),
            Path.Combine(currentDir, "SqlScripts")
        };

        string? sqlDir = null;
        foreach (var path in candidatePaths)
        {
            if (Directory.Exists(path) && Directory.GetFiles(path, "*.sql").Any())
            {
                sqlDir = Path.GetFullPath(path);
                break;
            }
        }

        if (string.IsNullOrEmpty(sqlDir))
        {
            logger.LogWarning("SqlScripts folder not found in any candidate paths: {Paths}", string.Join("; ", candidatePaths));
            return;
        }

        logger.LogInformation("Nạp SQL scripts từ thư mục: {Path}", sqlDir);

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
                logger.LogInformation("Nạp thành công SQL script: {File}", fileName);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi thực thi SQL script {File}", fileName);
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