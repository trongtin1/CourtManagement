using CourtManagementBE.Domain.IRepositories;

namespace CourtManagementBE.Domain.Common;

public interface IUnitOfWork : IDisposable
{
    IAuthRepository IAuthRepository { get; }
    IUserTokenRepository IUserTokenRepository { get; }
    IFacilityRepository IFacilityRepository { get; }
    IAreaRepository IAreaRepository { get; }
    ICourtRepository ICourtRepository { get; }
    ICourtTypeRepository ICourtTypeRepository { get; }
    ICourtStatusRepository ICourtStatusRepository { get; }
    ICourtFeatureRepository ICourtFeatureRepository { get; }
    ICourtFeatureMappingRepository ICourtFeatureMappingRepository { get; }
    ICourtAssetRepository ICourtAssetRepository { get; }
    IUtilityRepository IUtilityRepository { get; }
    IPriceRuleTypeRepository IPriceRuleTypeRepository { get; }
    ICourtDefaultPriceRuleRepository ICourtDefaultPriceRuleRepository { get; }
    ICourtLockedSlotRepository ICourtLockedSlotRepository { get; }
    ICourtPriceRepository ICourtPriceRepository { get; }
    ICustomerRepository ICustomerRepository { get; }
    IBookingRepository IBookingRepository { get; }
    IBookingSlotRepository IBookingSlotRepository { get; }
    IBookingServiceRepository IBookingServiceRepository { get; }
    IBookingComboRepository IBookingComboRepository { get; }
    IPaymentRepository IPaymentRepository { get; }
    IServiceRepository IServiceRepository { get; }

    ICourtAreaMappingRepository ICourtAreaMappingRepository { get; }
    ICourtUtilityRepository ICourtUtilityRepository { get; }
    ICourtPriceRuleHistoryRepository ICourtPriceRuleHistoryRepository { get; }
    IPaymentStatusRepository IPaymentStatusRepository { get; }
    IPaymentMethodRepository IPaymentMethodRepository { get; }
    ICustomerTypeRepository ICustomerTypeRepository { get; }
    IServiceTypeRepository IServiceTypeRepository { get; }
    IUnitRepository IUnitRepository { get; }
    IAssetCategoryRepository IAssetCategoryRepository { get; }
    IAssetConditionRepository IAssetConditionRepository { get; }
    ICourtFeatureCategoryRepository ICourtFeatureCategoryRepository { get; }
    ICancellationReasonRepository ICancellationReasonRepository { get; }
    IRefundReasonRepository IRefundReasonRepository { get; }
    IComboRepository IComboRepository { get; }
    IComboServiceRepository IComboServiceRepository { get; }
    IBookingGroupRepository IBookingGroupRepository { get; }
    IRecurringConfigRepository IRecurringConfigRepository { get; }
    IUnitConversionRepository IUnitConversionRepository { get; }
    IBookingHistoryRepository IBookingHistoryRepository { get; }
    IBookingStatusRepository IBookingStatusRepository { get; }
    ISystemSettingsRepository ISystemSettingsRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

}
