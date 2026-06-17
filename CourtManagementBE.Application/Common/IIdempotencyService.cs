using System.Threading.Tasks;

namespace CourtManagementBE.Application.Common
{
    public interface IIdempotencyService
    {
        Task<T?> GetResponseAsync<T>(string key, object requestBody) where T : class;
        Task SaveResponseAsync(string key, object requestBody, object response);
    }
}
