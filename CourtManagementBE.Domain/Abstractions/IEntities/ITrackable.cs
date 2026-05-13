using CourtManagementBE.Domain.Abstractions.Interfaces;
namespace CourtManagementBE.Domain.Abstractions.IEntities
{
    public interface ITrackable<T> : IEntityBase<T>, ISoftDelete, IDateTracking
    {
    }
}
