using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;

namespace CourtManagementBE.Infrastructure.Repositories;

public class AuthRepository : GenericRepository<User>, IAuthRepository
{
    public AuthRepository(AppDbContext context) : base(context)
    {
    }
}