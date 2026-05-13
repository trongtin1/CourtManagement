using CourtManagementBE.Domain.Abstractions.Interfaces;
namespace CourtManagementBE.Domain.Abstractions.IEntities
{
    public interface IAuditable : IDateTracking, ISoftDelete, IUserTracking
    {

    }
}
