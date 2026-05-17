using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace CourtManagementBE.Application.Common;

public interface ICurrentUserContext
{
    Guid? UserId { get; }
    string Role { get; }
    int? FacilityId { get; }
    int? WorkingFacilityId { get; }
    bool IsSuperAdmin { get; }
    bool CanAccessFacility(int facilityId);
}

public class CurrentUserContext : ICurrentUserContext
{
    public const string SuperAdminRole = "SuperAdmin";
    public const string FacilityManagerRole = "FacilityManager";
    public const string StaffRole = "Staff";
    public const string FacilityClaimType = "facility_id";
    public const string WorkingFacilityHeader = "X-Facility-Id";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string Role =>
        User?.FindFirstValue(ClaimTypes.Role)
        ?? User?.FindFirstValue("role")
        ?? SuperAdminRole;

    public int? FacilityId
    {
        get
        {
            var value = User?.FindFirstValue(FacilityClaimType);
            return int.TryParse(value, out var facilityId) && facilityId > 0
                ? facilityId
                : null;
        }
    }

    public int? WorkingFacilityId
    {
        get
        {
            if (!IsSuperAdmin)
            {
                return FacilityId;
            }

            var value = _httpContextAccessor.HttpContext?.Request.Headers[WorkingFacilityHeader].ToString();
            return int.TryParse(value, out var facilityId) && facilityId > 0
                ? facilityId
                : null;
        }
    }

    public bool IsSuperAdmin =>
        Role.Equals(SuperAdminRole, StringComparison.OrdinalIgnoreCase)
        || Role.Equals("Administrator", StringComparison.OrdinalIgnoreCase);

    public bool CanAccessFacility(int facilityId)
    {
        if (IsSuperAdmin)
        {
            return WorkingFacilityId is null || WorkingFacilityId == facilityId;
        }

        return FacilityId == facilityId;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;
}
