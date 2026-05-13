using CourtManagementBE.Domain.Abstractions.Interfaces;
namespace CourtManagementBE.Domain.Abstractions.IEntities
{
    public interface IEntityAuditBase<T> : IEntityBase<T>, IAuditable
    {

    }
}
