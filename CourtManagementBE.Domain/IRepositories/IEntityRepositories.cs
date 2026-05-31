using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Domain.IRepositories;

public interface IFacilityRepository : IGenericRepository<Facilities> { }
public interface IAreaRepository : IGenericRepository<Areas> { }
public interface ICourtTypeRepository : IGenericRepository<CourtTypes> { }
public interface ICourtStatusRepository : IGenericRepository<CourtStatus> { }
public interface ICourtFeatureRepository : IGenericRepository<CourtFeatures> { }
public interface ICourtFeatureMappingRepository : IGenericRepository<CourtFeatureMappings> { }
public interface ICourtAssetRepository : IGenericRepository<CourtAssets> { }
public interface IUtilityRepository : IGenericRepository<Utilities> { }
public interface IPriceRuleTypeRepository : IGenericRepository<PriceRuleTypes> { }
public interface ICourtDefaultPriceRuleRepository : IGenericRepository<CourtDefaultPriceRule> { }
public interface ICourtLockedSlotRepository : IGenericRepository<CourtLockedSlot> { }
public interface ICustomerRepository : IGenericRepository<Customers> { }
public interface IBookingRepository : IGenericRepository<Bookings> { }
public interface IBookingSlotRepository : IGenericRepository<BookingSlots> { }
public interface IBookingServiceRepository : IGenericRepository<BookingServices> { }
public interface IPaymentRepository : IGenericRepository<Payments> { }
public interface IServiceRepository : IGenericRepository<Services> { }
public interface ICourtAreaMappingRepository : IGenericRepository<CourtAreaMapping> { }
public interface ICourtUtilityRepository : IGenericRepository<CourtUtilities> { }
public interface ICourtPriceRuleHistoryRepository : IGenericRepository<CourtPriceRuleHistory> { }
public interface IPaymentStatusRepository : IGenericRepository<PaymentStatuses> { }
public interface IPaymentMethodRepository : IGenericRepository<PaymentMethods> { }
public interface ICustomerTypeRepository : IGenericRepository<CustomerTypes> { }
public interface IServiceTypeRepository : IGenericRepository<ServiceTypes> { }
public interface IUnitRepository : IGenericRepository<Units> { }
public interface IAssetCategoryRepository : IGenericRepository<AssetCategories> { }
public interface IAssetConditionRepository : IGenericRepository<AssetConditions> { }
public interface ICourtFeatureCategoryRepository : IGenericRepository<CourtFeatureCategories> { }
public interface ICancellationReasonRepository : IGenericRepository<CancellationReasons> { }
public interface IRefundReasonRepository : IGenericRepository<RefundReasons> { }
public interface IComboRepository : IGenericRepository<Combos> { }
public interface IComboServiceRepository : IGenericRepository<ComboServices> { }
public interface IBookingGroupRepository : IGenericRepository<BookingGroups> { }
public interface IRecurringConfigRepository : IGenericRepository<RecurringConfigs> { }
public interface IUnitConversionRepository : IGenericRepository<UnitConversions> { }
public interface IAuditLogRepository : IGenericRepository<AuditLog> { }
public interface IBookingHistoryRepository : IGenericRepository<BookingHistories> { }
public interface IBookingStatusRepository : IGenericRepository<BookingStatuses> { }
