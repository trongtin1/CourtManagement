using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace CourtManagementBE.Infrastructure.Common;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;
    private readonly ILogger<UnitOfWork> _logger;

    // ── Backing Fields ───────────────────────────────────────────
    private IGenericRepository<User>? _authRepository;
    private IGenericRepository<UserToken>? _userTokenRepository;
    private IGenericRepository<Facilities>? _facilityRepository;
    private IGenericRepository<Areas>? _areaRepository;
    private ICourtRepository? _courtRepository;
    private IGenericRepository<CourtTypes>? _courtTypeRepository;
    private IGenericRepository<CourtStatus>? _courtStatusRepository;
    private IGenericRepository<CourtFeatures>? _courtFeatureRepository;
    private IGenericRepository<CourtFeatureMappings>? _courtFeatureMappingRepository;
    private IGenericRepository<CourtAssets>? _courtAssetRepository;
    private IGenericRepository<Utilities>? _utilityRepository;
    private IGenericRepository<PriceRuleTypes>? _priceRuleTypeRepository;
    private IGenericRepository<CourtDefaultPriceRule>? _courtDefaultPriceRuleRepository;
    private IGenericRepository<CourtLockedSlot>? _courtLockedSlotRepository;
    private ICourtPriceRepository? _courtPriceRepository;
    private IGenericRepository<Customers>? _customerRepository;
    private IBookingRepository? _bookingRepository;
    private IGenericRepository<BookingSlots>? _bookingSlotRepository;
    private IBookingServiceRepository? _bookingServiceRepository;
    private IBookingComboRepository? _bookingComboRepository;
    private IGenericRepository<Payments>? _paymentRepository;
    private IGenericRepository<Services>? _serviceRepository;

    private IGenericRepository<CourtAreaMapping>? _courtAreaMappingRepository;
    private IGenericRepository<CourtUtilities>? _courtUtilityRepository;
    private IGenericRepository<CourtPriceRuleHistory>? _courtPriceRuleHistoryRepository;
    private IGenericRepository<PaymentStatuses>? _paymentStatusRepository;
    private IGenericRepository<PaymentMethods>? _paymentMethodRepository;
    private IGenericRepository<CustomerTypes>? _customerTypeRepository;
    private IGenericRepository<ServiceTypes>? _serviceTypeRepository;
    private IGenericRepository<Units>? _unitRepository;
    private IGenericRepository<AssetCategories>? _assetCategoryRepository;
    private IGenericRepository<AssetConditions>? _assetConditionRepository;
    private IGenericRepository<CourtFeatureCategories>? _courtFeatureCategoryRepository;
    private IGenericRepository<CancellationReasons>? _cancellationReasonRepository;
    private IGenericRepository<RefundReasons>? _refundReasonRepository;
    private IGenericRepository<Combos>? _comboRepository;
    private IGenericRepository<ComboServices>? _comboServiceRepository;
    private IBookingGroupRepository? _bookingGroupRepository;
    private IGenericRepository<RecurringConfigs>? _recurringConfigRepository;
    private IGenericRepository<UnitConversions>? _unitConversionRepository;
    private IGenericRepository<BookingHistories>? _bookingHistoryRepository;
    private IGenericRepository<BookingStatuses>? _bookingStatusRepository;
    private IGenericRepository<SystemSettings>? _systemSettingsRepository;

    public UnitOfWork(AppDbContext context, ILogger<UnitOfWork> logger)
    {
        _context = context;
        _logger = logger;
    }

    // ── Repository Properties ────────────────────────────────────
    public IGenericRepository<User> IAuthRepository => _authRepository ??= new GenericRepository<User>(_context);
    public IGenericRepository<UserToken> IUserTokenRepository => _userTokenRepository ??= new GenericRepository<UserToken>(_context);
    public IGenericRepository<Facilities> IFacilityRepository => _facilityRepository ??= new GenericRepository<Facilities>(_context);
    public IGenericRepository<Areas> IAreaRepository => _areaRepository ??= new GenericRepository<Areas>(_context);
    public ICourtRepository ICourtRepository => _courtRepository ??= new CourtRepository(_context);
    public IGenericRepository<CourtTypes> ICourtTypeRepository => _courtTypeRepository ??= new GenericRepository<CourtTypes>(_context);
    public IGenericRepository<CourtStatus> ICourtStatusRepository => _courtStatusRepository ??= new GenericRepository<CourtStatus>(_context);
    public IGenericRepository<CourtFeatures> ICourtFeatureRepository => _courtFeatureRepository ??= new GenericRepository<CourtFeatures>(_context);
    public IGenericRepository<CourtFeatureMappings> ICourtFeatureMappingRepository => _courtFeatureMappingRepository ??= new GenericRepository<CourtFeatureMappings>(_context);
    public IGenericRepository<CourtAssets> ICourtAssetRepository => _courtAssetRepository ??= new GenericRepository<CourtAssets>(_context);
    public IGenericRepository<Utilities> IUtilityRepository => _utilityRepository ??= new GenericRepository<Utilities>(_context);
    public IGenericRepository<PriceRuleTypes> IPriceRuleTypeRepository => _priceRuleTypeRepository ??= new GenericRepository<PriceRuleTypes>(_context);
    public IGenericRepository<CourtDefaultPriceRule> ICourtDefaultPriceRuleRepository => _courtDefaultPriceRuleRepository ??= new GenericRepository<CourtDefaultPriceRule>(_context);
    public IGenericRepository<CourtLockedSlot> ICourtLockedSlotRepository => _courtLockedSlotRepository ??= new GenericRepository<CourtLockedSlot>(_context);
    public ICourtPriceRepository ICourtPriceRepository => _courtPriceRepository ??= new CourtPriceRepository(_context);
    public IGenericRepository<Customers> ICustomerRepository => _customerRepository ??= new GenericRepository<Customers>(_context);
    public IBookingRepository IBookingRepository => _bookingRepository ??= new BookingRepository(_context);
    public IGenericRepository<BookingSlots> IBookingSlotRepository => _bookingSlotRepository ??= new GenericRepository<BookingSlots>(_context);
    public IBookingServiceRepository IBookingServiceRepository => _bookingServiceRepository ??= new BookingServiceRepository(_context);
    public IBookingComboRepository IBookingComboRepository => _bookingComboRepository ??= new BookingComboRepository(_context);
    public IGenericRepository<Payments> IPaymentRepository => _paymentRepository ??= new GenericRepository<Payments>(_context);
    public IGenericRepository<Services> IServiceRepository => _serviceRepository ??= new GenericRepository<Services>(_context);

    public IGenericRepository<CourtAreaMapping> ICourtAreaMappingRepository => _courtAreaMappingRepository ??= new GenericRepository<CourtAreaMapping>(_context);
    public IGenericRepository<CourtUtilities> ICourtUtilityRepository => _courtUtilityRepository ??= new GenericRepository<CourtUtilities>(_context);
    public IGenericRepository<CourtPriceRuleHistory> ICourtPriceRuleHistoryRepository => _courtPriceRuleHistoryRepository ??= new GenericRepository<CourtPriceRuleHistory>(_context);
    public IGenericRepository<PaymentStatuses> IPaymentStatusRepository => _paymentStatusRepository ??= new GenericRepository<PaymentStatuses>(_context);
    public IGenericRepository<PaymentMethods> IPaymentMethodRepository => _paymentMethodRepository ??= new GenericRepository<PaymentMethods>(_context);
    public IGenericRepository<CustomerTypes> ICustomerTypeRepository => _customerTypeRepository ??= new GenericRepository<CustomerTypes>(_context);
    public IGenericRepository<ServiceTypes> IServiceTypeRepository => _serviceTypeRepository ??= new GenericRepository<ServiceTypes>(_context);
    public IGenericRepository<Units> IUnitRepository => _unitRepository ??= new GenericRepository<Units>(_context);
    public IGenericRepository<AssetCategories> IAssetCategoryRepository => _assetCategoryRepository ??= new GenericRepository<AssetCategories>(_context);
    public IGenericRepository<AssetConditions> IAssetConditionRepository => _assetConditionRepository ??= new GenericRepository<AssetConditions>(_context);
    public IGenericRepository<CourtFeatureCategories> ICourtFeatureCategoryRepository => _courtFeatureCategoryRepository ??= new GenericRepository<CourtFeatureCategories>(_context);
    public IGenericRepository<CancellationReasons> ICancellationReasonRepository => _cancellationReasonRepository ??= new GenericRepository<CancellationReasons>(_context);
    public IGenericRepository<RefundReasons> IRefundReasonRepository => _refundReasonRepository ??= new GenericRepository<RefundReasons>(_context);
    public IGenericRepository<Combos> IComboRepository => _comboRepository ??= new GenericRepository<Combos>(_context);
    public IGenericRepository<ComboServices> IComboServiceRepository => _comboServiceRepository ??= new GenericRepository<ComboServices>(_context);
    public IBookingGroupRepository IBookingGroupRepository => _bookingGroupRepository ??= new BookingGroupRepository(_context);
    public IGenericRepository<RecurringConfigs> IRecurringConfigRepository => _recurringConfigRepository ??= new GenericRepository<RecurringConfigs>(_context);
    public IGenericRepository<UnitConversions> IUnitConversionRepository => _unitConversionRepository ??= new GenericRepository<UnitConversions>(_context);
    public IGenericRepository<BookingHistories> IBookingHistoryRepository => _bookingHistoryRepository ??= new GenericRepository<BookingHistories>(_context);
    public IGenericRepository<BookingStatuses> IBookingStatusRepository => _bookingStatusRepository ??= new GenericRepository<BookingStatuses>(_context);
    public IGenericRepository<SystemSettings> ISystemSettingsRepository => _systemSettingsRepository ??= new GenericRepository<SystemSettings>(_context);



    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _currentTransaction ??= await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);

            if (_currentTransaction is not null)
            {
                await _currentTransaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }

            _disposed = true;
        }
    }
}
