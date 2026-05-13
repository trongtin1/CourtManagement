using System.Security.Claims;

namespace CourtManagementBE.Infrastructure.Extensions.HttpContextExtensions
{
    public interface IHttpContextHelper
    {
        string GetCurrentUserEmail();
        string GetCurrentURlRequest();
        string GetCurrentIp();
        void UpdateCurrentUserEmail(ClaimsPrincipal principal);
        string GetCurrentUserName();
        string GetCurrentCookie();
        string GetCurrentClientId();
    }
}
