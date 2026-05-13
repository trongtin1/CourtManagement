using CourtManagementBE.Domain.Abstractions.IEntities;

namespace CourtManagementBE.Domain.Abstractions.Base
{
    public abstract class EntityDeleteBase<T> : EntityBase<T>, IEntityDeleteBase<T>
    {
        public bool IsDelete { get; set; }
    }
}