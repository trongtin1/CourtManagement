using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Infrastructure.Extensions.SqlExtentions;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;

namespace CourtManagementBE.Infrastructure.Repositories;

public class FacilityRepository : GenericRepository<Facilities>, IFacilityRepository
{ public FacilityRepository(AppDbContext ctx) : base(ctx) { } }

public class AreaRepository : GenericRepository<Areas>, IAreaRepository
{ public AreaRepository(AppDbContext ctx) : base(ctx) { } }


public class CourtTypeRepository : GenericRepository<CourtTypes>, ICourtTypeRepository
{ public CourtTypeRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtStatusRepository : GenericRepository<CourtStatus>, ICourtStatusRepository
{ public CourtStatusRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtFeatureRepository : GenericRepository<CourtFeatures>, ICourtFeatureRepository
{ public CourtFeatureRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtFeatureMappingRepository : GenericRepository<CourtFeatureMappings>, ICourtFeatureMappingRepository
{ public CourtFeatureMappingRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtAssetRepository : GenericRepository<CourtAssets>, ICourtAssetRepository
{ public CourtAssetRepository(AppDbContext ctx) : base(ctx) { } }

public class UtilityRepository : GenericRepository<Utilities>, IUtilityRepository
{ public UtilityRepository(AppDbContext ctx) : base(ctx) { } }

public class PriceRuleTypeRepository : GenericRepository<PriceRuleTypes>, IPriceRuleTypeRepository
{ public PriceRuleTypeRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtDefaultPriceRuleRepository : GenericRepository<CourtDefaultPriceRule>, ICourtDefaultPriceRuleRepository
{ public CourtDefaultPriceRuleRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtLockedSlotRepository : GenericRepository<CourtLockedSlot>, ICourtLockedSlotRepository
{ public CourtLockedSlotRepository(AppDbContext ctx) : base(ctx) { } }

public class CustomerRepository : GenericRepository<Customers>, ICustomerRepository
{ public CustomerRepository(AppDbContext ctx) : base(ctx) { } }

public class BookingRepository : GenericRepository<Bookings>, IBookingRepository
{ public BookingRepository(AppDbContext ctx) : base(ctx) { } }

public class BookingSlotRepository : GenericRepository<BookingSlots>, IBookingSlotRepository
{ public BookingSlotRepository(AppDbContext ctx) : base(ctx) { } }

public class BookingServiceRepository : GenericRepository<BookingServices>, IBookingServiceRepository
{ public BookingServiceRepository(AppDbContext ctx) : base(ctx) { } }

public class PaymentRepository : GenericRepository<Payments>, IPaymentRepository
{ public PaymentRepository(AppDbContext ctx) : base(ctx) { } }

public class ServiceRepository : GenericRepository<Services>, IServiceRepository
{ public ServiceRepository(AppDbContext ctx) : base(ctx) { } }


public class CourtAreaMappingRepository : GenericRepository<CourtAreaMapping>, ICourtAreaMappingRepository
{ public CourtAreaMappingRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtUtilityRepository : GenericRepository<CourtUtilities>, ICourtUtilityRepository
{ public CourtUtilityRepository(AppDbContext ctx) : base(ctx) { } }

public class CourtPriceRuleHistoryRepository : GenericRepository<CourtPriceRuleHistory>, ICourtPriceRuleHistoryRepository
{ public CourtPriceRuleHistoryRepository(AppDbContext ctx) : base(ctx) { } }

public class BookingStatusRepository : GenericRepository<BookingStatuses>, IBookingStatusRepository
{ public BookingStatusRepository(AppDbContext ctx) : base(ctx) { } }
public class PaymentStatusRepository : GenericRepository<PaymentStatuses>, IPaymentStatusRepository
{ public PaymentStatusRepository(AppDbContext ctx) : base(ctx) { } }
public class PaymentMethodRepository : GenericRepository<PaymentMethods>, IPaymentMethodRepository
{ public PaymentMethodRepository(AppDbContext ctx) : base(ctx) { } }
public class CustomerTypeRepository : GenericRepository<CustomerTypes>, ICustomerTypeRepository
{ public CustomerTypeRepository(AppDbContext ctx) : base(ctx) { } }
public class ServiceTypeRepository : GenericRepository<ServiceTypes>, IServiceTypeRepository
{ public ServiceTypeRepository(AppDbContext ctx) : base(ctx) { } }
public class UnitRepository : GenericRepository<Units>, IUnitRepository
{ public UnitRepository(AppDbContext ctx) : base(ctx) { } }
public class AssetCategoryRepository : GenericRepository<AssetCategories>, IAssetCategoryRepository
{ public AssetCategoryRepository(AppDbContext ctx) : base(ctx) { } }
public class AssetConditionRepository : GenericRepository<AssetConditions>, IAssetConditionRepository
{ public AssetConditionRepository(AppDbContext ctx) : base(ctx) { } }
public class CourtFeatureCategoryRepository : GenericRepository<CourtFeatureCategories>, ICourtFeatureCategoryRepository
{ public CourtFeatureCategoryRepository(AppDbContext ctx) : base(ctx) { } }
public class CancellationReasonRepository : GenericRepository<CancellationReasons>, ICancellationReasonRepository
{ public CancellationReasonRepository(AppDbContext ctx) : base(ctx) { } }
public class RefundReasonRepository : GenericRepository<RefundReasons>, IRefundReasonRepository
{ public RefundReasonRepository(AppDbContext ctx) : base(ctx) { } }
public class ComboRepository : GenericRepository<Combos>, IComboRepository
{ public ComboRepository(AppDbContext ctx) : base(ctx) { } }
public class ComboServiceRepository : GenericRepository<ComboServices>, IComboServiceRepository
{ public ComboServiceRepository(AppDbContext ctx) : base(ctx) { } }