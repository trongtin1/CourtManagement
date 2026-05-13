using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;

namespace CourtManagementBE.Infrastructure.Extensions.HttpContextExtensions
{
    public class HttpContextHelper : IHttpContextHelper
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpContextHelper(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetCurrentUserEmail()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null)
            {
                return string.Empty;
            }

            return user.FindFirstValue(ClaimTypes.Email)
                ?? user.FindFirstValue("email")
                ?? user.FindFirstValue("Email")
                ?? string.Empty;
        }

        public string GetCurrentURlRequest()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request is null)
            {
                return string.Empty;
            }

            var pathAndQuery = $"{request.Path}{request.QueryString}";
            if (!request.Host.HasValue)
            {
                return pathAndQuery;
            }

            return $"{request.Scheme}://{request.Host}{pathAndQuery}";
        }

        public string GetCurrentIp()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context is null)
            {
                return string.Empty;
            }

            var forwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
            if (!string.IsNullOrWhiteSpace(forwardedFor))
            {
                return forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)[0];
            }

            var realIp = context.Request.Headers["X-Real-IP"].ToString();
            if (!string.IsNullOrWhiteSpace(realIp))
            {
                return realIp.Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        }

        public void UpdateCurrentUserEmail(ClaimsPrincipal principal)
        {
            if (principal is null)
            {
                return;
            }

            var context = _httpContextAccessor.HttpContext;
            if (context is null)
            {
                return;
            }

            var email = principal.FindFirstValue(ClaimTypes.Email)
                ?? principal.FindFirstValue("email")
                ?? principal.FindFirstValue("Email");

            if (string.IsNullOrWhiteSpace(email))
            {
                context.User = principal;
                return;
            }

            if (context.User?.Identity is not ClaimsIdentity identity)
            {
                context.User = principal;
                return;
            }

            var existing = identity.FindFirst(ClaimTypes.Email)
                ?? identity.FindFirst("email")
                ?? identity.FindFirst("Email");

            if (existing is not null)
            {
                identity.RemoveClaim(existing);
            }

            identity.AddClaim(new Claim(ClaimTypes.Email, email));
        }

        public string GetCurrentUserName()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null)
            {
                return string.Empty;
            }

            return user.FindFirstValue(ClaimTypes.Name)
                ?? user.Identity?.Name
                ?? user.FindFirstValue("name")
                ?? user.FindFirstValue("username")
                ?? string.Empty;
        }

        public string GetCurrentCookie()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request is null)
            {
                return string.Empty;
            }

            if (request.Cookies.TryGetValue("refreshToken", out var refreshToken)
                && !string.IsNullOrWhiteSpace(refreshToken))
            {
                return refreshToken;
            }

            return request.Headers["Cookie"].ToString();
        }

        public string GetCurrentClientId()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context is null)
            {
                return string.Empty;
            }

            var user = context.User;
            var clientId = user?.FindFirstValue("client_id")
                ?? user?.FindFirstValue("clientId")
                ?? context.Request.Headers["X-Client-Id"].ToString()
                ?? context.Request.Headers["Client-Id"].ToString()
                ?? context.Request.Query["clientId"].ToString()
                ?? context.Request.Query["client_id"].ToString();

            return clientId ?? string.Empty;
        }
    }
}
