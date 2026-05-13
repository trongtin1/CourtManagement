using CourtManagementBE.Domain.IRepositories;

namespace CourtManagementBE.Domain.Common;

public interface IUnitOfWork : IDisposable
{
    IAuthRepository IAuthRepository { get; }
    IUserTokenRepository IUserTokenRepository { get; }
    ITenantRepository ITenantRepository { get; }
    IFacilityRepository IFacilityRepository { get; }
    IAreaRepository IAreaRepository { get; }
    ICourtRepository ICourtRepository { get; }
    ICourtTypeRepository ICourtTypeRepository { get; }
    ICourtStatusRepository ICourtStatusRepository { get; }
    IUtilityRepository IUtilityRepository { get; }
    ITimeSlotRepository ITimeSlotRepository { get; }
    ICourtPriceRepository ICourtPriceRepository { get; }
    ICustomerRepository ICustomerRepository { get; }
    IBookingRepository IBookingRepository { get; }
    IBookingSlotRepository IBookingSlotRepository { get; }
    IBookingServiceRepository IBookingServiceRepository { get; }
    IPaymentRepository IPaymentRepository { get; }
    IServiceRepository IServiceRepository { get; }
    IServicePriceRepository IServicePriceRepository { get; }
    ICourtAreaMappingRepository ICourtAreaMappingRepository { get; }
    ICourtUtilityRepository ICourtUtilityRepository { get; }
    ICourtPriceHistoryRepository ICourtPriceHistoryRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
