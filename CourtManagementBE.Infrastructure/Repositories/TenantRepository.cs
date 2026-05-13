using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;

namespace CourtManagementBE.Infrastructure.Repositories;

public class TenantRepository : GenericRepository<Tenant>, ITenantRepository
{
    public TenantRepository(AppDbContext context) : base(context)
    {
    }
}
