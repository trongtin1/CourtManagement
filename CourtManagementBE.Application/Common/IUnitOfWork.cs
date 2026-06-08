using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Domain.Common;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<User> IAuthRepository { get; }
    IGenericRepository<UserToken> IUserTokenRepository { get; }
    IGenericRepository<Facilities> IFacilityRepository { get; }
    IGenericRepository<Areas> IAreaRepository { get; }
    ICourtRepository ICourtRepository { get; }
    IGenericRepository<CourtTypes> ICourtTypeRepository { get; }
    IGenericRepository<CourtStatus> ICourtStatusRepository { get; }
    IGenericRepository<CourtFeatures> ICourtFeatureRepository { get; }
    IGenericRepository<CourtFeatureMappings> ICourtFeatureMappingRepository { get; }
    IGenericRepository<CourtAssets> ICourtAssetRepository { get; }
    IGenericRepository<Utilities> IUtilityRepository { get; }
    IGenericRepository<PriceRuleTypes> IPriceRuleTypeRepository { get; }
    IGenericRepository<CourtDefaultPriceRule> ICourtDefaultPriceRuleRepository { get; }
    IGenericRepository<CourtLockedSlot> ICourtLockedSlotRepository { get; }
    ICourtPriceRepository ICourtPriceRepository { get; }
    IGenericRepository<Customers> ICustomerRepository { get; }
    IBookingRepository IBookingRepository { get; }
    IGenericRepository<BookingSlots> IBookingSlotRepository { get; }
    IBookingServiceRepository IBookingServiceRepository { get; }
    IBookingComboRepository IBookingComboRepository { get; }
    IGenericRepository<Payments> IPaymentRepository { get; }
    IGenericRepository<Services> IServiceRepository { get; }

    IGenericRepository<CourtAreaMapping> ICourtAreaMappingRepository { get; }
    IGenericRepository<CourtUtilities> ICourtUtilityRepository { get; }
    IGenericRepository<CourtPriceRuleHistory> ICourtPriceRuleHistoryRepository { get; }
    IGenericRepository<PaymentStatuses> IPaymentStatusRepository { get; }
    IGenericRepository<PaymentMethods> IPaymentMethodRepository { get; }
    IGenericRepository<CustomerTypes> ICustomerTypeRepository { get; }
    IGenericRepository<ServiceTypes> IServiceTypeRepository { get; }
    IGenericRepository<Units> IUnitRepository { get; }
    IGenericRepository<AssetCategories> IAssetCategoryRepository { get; }
    IGenericRepository<AssetConditions> IAssetConditionRepository { get; }
    IGenericRepository<CourtFeatureCategories> ICourtFeatureCategoryRepository { get; }
    IGenericRepository<CancellationReasons> ICancellationReasonRepository { get; }
    IGenericRepository<RefundReasons> IRefundReasonRepository { get; }
    IGenericRepository<Combos> IComboRepository { get; }
    IGenericRepository<ComboServices> IComboServiceRepository { get; }
    IBookingGroupRepository IBookingGroupRepository { get; }
    IGenericRepository<RecurringConfigs> IRecurringConfigRepository { get; }
    IGenericRepository<UnitConversions> IUnitConversionRepository { get; }
    IGenericRepository<BookingHistories> IBookingHistoryRepository { get; }
    IGenericRepository<BookingStatuses> IBookingStatusRepository { get; }
    IGenericRepository<SystemSettings> ISystemSettingsRepository { get; }
    IGenericRepository<AccountingAccountTypes> IAccountingAccountTypeRepository { get; }
    IGenericRepository<JournalDocumentTypes> IJournalDocumentTypeRepository { get; }
    IGenericRepository<BusinessPartnerTypes> IBusinessPartnerTypeRepository { get; }
    IGenericRepository<BankAccount> IBankAccountRepository { get; }
    IGenericRepository<CashFund> ICashFundRepository { get; }
    IGenericRepository<ChartOfAccount> IChartOfAccountRepository { get; }
    IGenericRepository<AccountingRule> IAccountingRuleRepository { get; }
    IGenericRepository<AccountingRuleCondition> IAccountingRuleConditionRepository { get; }
    IGenericRepository<JournalEntry> IJournalEntryRepository { get; }
    IGenericRepository<JournalEntryLine> IJournalEntryLineRepository { get; }
    IGenericRepository<BusinessPartner> IBusinessPartnerRepository { get; }
    IGenericRepository<AccountReceivable> IAccountReceivableRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
