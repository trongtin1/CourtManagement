using System.Net;
using System.Text.Json.Serialization;
using CourtManagementBE.Application.Helpers;

namespace CourtManagementBE.Application.Common;

public class Result<T>
{
    [JsonConverter(typeof(HttpStatusCodeToIntConverter))]
    public HttpStatusCode StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static Result<T> Success(T data, string message = "Success")
        => new()
        {
            StatusCode = HttpStatusCode.OK,
            IsSuccess = true,
            Message = message,
            Data = data
        };

    public static Result<T> Failure(HttpStatusCode statusCode, string message)
        => new()
        {
            StatusCode = statusCode,
            IsSuccess = false,
            Message = message
        };
}