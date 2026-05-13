using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;

namespace CourtManagementBE.Infrastructure.Repositories;

public class UserTokenRepository : GenericRepository<UserToken>, IUserTokenRepository
{
    public UserTokenRepository(AppDbContext context) : base(context)
    {
    }
}