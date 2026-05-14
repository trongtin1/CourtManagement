using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Domain.IRepositories;

public interface IFacilityRepository : IGenericRepository<Facilities> { }
public interface IAreaRepository : IGenericRepository<Areas> { }
public interface ICourtRepository : IGenericRepository<Courts> { }
public interface ICourtTypeRepository : IGenericRepository<CourtTypes> { }
public interface ICourtStatusRepository : IGenericRepository<CourtStatus> { }
public interface ICourtFeatureRepository : IGenericRepository<CourtFeatures> { }
public interface IUtilityRepository : IGenericRepository<Utilities> { }
public interface ITimeSlotRepository : IGenericRepository<TimeSlots> { }
public interface ICourtPriceRepository : IGenericRepository<CourtPriceByTimeSlot> { }
public interface ICustomerRepository : IGenericRepository<Customers> { }
public interface IBookingRepository : IGenericRepository<Bookings> { }
public interface IBookingSlotRepository : IGenericRepository<BookingSlots> { }
public interface IBookingServiceRepository : IGenericRepository<BookingServices> { }
public interface IPaymentRepository : IGenericRepository<Payments> { }
public interface IServiceRepository : IGenericRepository<Services> { }
public interface IServicePriceRepository : IGenericRepository<ServicePrice> { }
public interface ICourtAreaMappingRepository : IGenericRepository<CourtAreaMapping> { }
public interface ICourtUtilityRepository : IGenericRepository<CourtUtilities> { }
public interface ICourtPriceHistoryRepository : IGenericRepository<CourtPriceHistory> { }
