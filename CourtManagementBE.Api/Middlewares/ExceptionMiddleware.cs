using System.Net;
using System.Text.Json;
using CourtManagementBE.Application.Common;

namespace CourtManagementBE.Api.Middlewares;

public static class ExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionMiddleware>();
}

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);

            // bắt các status code như 401, 403, 404
            if (context.Response.StatusCode >= 400 &&
                context.Response.StatusCode < 600 &&
                !context.Response.HasStarted)
            {
                await HandleStatusCodeAsync(context);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Lỗi chưa xử lý tại {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleStatusCodeAsync(HttpContext context)
    {
        HttpStatusCode statusCode = (HttpStatusCode)context.Response.StatusCode;

        string message = statusCode switch
        {
            HttpStatusCode.Unauthorized => "Bạn cần đăng nhập để tiếp tục.",
            HttpStatusCode.Forbidden => "Bạn không có quyền thực hiện thao tác này.",
            HttpStatusCode.NotFound => "Không tìm thấy dữ liệu phù hợp.",
            _ => "Đã xảy ra lỗi. Vui lòng thử lại sau."
        };

        var result = Result<object>.Failure(statusCode, message);

        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(result,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        await context.Response.WriteAsync(json);
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        const string message = "Đã xảy ra lỗi. Vui lòng thử lại sau.";

        var result = Result<object>.Failure(
            HttpStatusCode.InternalServerError,
            message
        );

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var json = JsonSerializer.Serialize(result,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        await context.Response.WriteAsync(json);
    }
}