using CourtManagementBE.Domain.Abstractions.Interfaces;
namespace CourtManagementBE.Domain.Abstractions.IEntities
{
    public interface IEntityDeleteBase<T> : IEntityBase<T>, ISoftDelete
    {
    }
}
