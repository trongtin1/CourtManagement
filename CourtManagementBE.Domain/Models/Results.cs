namespace CourtManagementBE.Domain.Models
{
    public class Results<T>
    {
        public int StatusCode { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public T Data { get; set; } = default!;

        public static Results<T> Success(T data, string message = "Thao tác thành công")
        {
            return new Results<T>
            {
                StatusCode = 200,
                IsSuccess = true,
                Message = message,
                Data = data
            };
        }
    }
}