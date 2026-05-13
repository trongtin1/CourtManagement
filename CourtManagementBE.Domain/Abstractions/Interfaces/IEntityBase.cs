namespace CourtManagementBE.Domain.Abstractions.Interfaces
{
    public interface IEntityBase<T>
    {
        T Id { get; set; }
    }
}
