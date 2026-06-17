using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Extensions.Http;
using Polly.Retry;

namespace CourtManagementBE.Api.Extensions
{
    public static class HttpClientResilienceExtensions
    {
        private static readonly HttpStatusCode[] httpStatusCodesWorthRetrying = new[] {
            HttpStatusCode.InternalServerError, // 500
            HttpStatusCode.BadGateway,          // 502
            HttpStatusCode.ServiceUnavailable,  // 503
            HttpStatusCode.GatewayTimeout       // 504
        };

        public static IHttpClientBuilder AddResilientPolicyHandler(this IHttpClientBuilder builder)
        {
            return builder.AddPolicyHandler((serviceProvider, request) =>
            {
                var logger = serviceProvider.GetRequiredService<ILogger<HttpClient>>();

                // Trả về chính sách tương ứng dựa trên HTTP Method của request
                if (request.Method == HttpMethod.Get)
                {
                    return GetRetryPolicy(logger);
                }

                return PostRetryPolicy(logger, request.Method.ToString(), request.RequestUri?.ToString() ?? string.Empty);
            });
        }

        private static AsyncRetryPolicy<HttpResponseMessage> GetRetryPolicy(ILogger logger)
        {
            return Policy.Handle<HttpRequestException>()
                .OrResult<HttpResponseMessage>(msg => (int)msg.StatusCode > (int)HttpStatusCode.RequestTimeout)
                .WaitAndRetryAsync(3, 
                    retryAttempt => 
                    {
                        Console.WriteLine("Retrying get http client");
                        return TimeSpan.FromSeconds(5);
                    },
                    onRetry: (outcome, timespan, retryCount, context) =>
                    {
                        var exceptionMessage = outcome.Exception?.Message;
                        var statusCode = outcome.Result?.StatusCode;
                        logger.LogWarning(
                            "[Polly GET Retry] Thử lại lần thứ {RetryCount} sau {Delay} giây do gặp lỗi: {Error} - Status Code: {StatusCode}",
                            retryCount,
                            timespan.TotalSeconds,
                            exceptionMessage ?? "HTTP Status Code lỗi",
                            statusCode);
                    });
        }

        private static AsyncRetryPolicy<HttpResponseMessage> PostRetryPolicy(ILogger logger, string method, string requestUri)
        {
            return Policy.Handle<HttpRequestException>()
                .OrResult<HttpResponseMessage>(msg => httpStatusCodesWorthRetrying.Contains(msg.StatusCode))
                .WaitAndRetryAsync(3, 
                    retryAttempt => 
                    {
                        Console.WriteLine("Retrying get http client");
                        return TimeSpan.FromSeconds(5);
                    },
                    onRetry: (outcome, timespan, retryCount, context) =>
                    {
                        var exceptionMessage = outcome.Exception?.Message;
                        var statusCode = outcome.Result?.StatusCode;
                        logger.LogWarning(
                            "[Polly Mutation Retry] Thử lại lần thứ {RetryCount} sau {Delay} giây cho request {Method} {RequestUri} do gặp lỗi hệ thống tạm thời: {Error} - Status Code: {StatusCode}",
                            retryCount,
                            timespan.TotalSeconds,
                            method,
                            requestUri,
                            exceptionMessage ?? "HTTP Status Code lỗi",
                            statusCode);
                    });
        }
    }
}
