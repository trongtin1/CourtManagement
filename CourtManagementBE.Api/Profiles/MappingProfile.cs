using AutoMapper;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Api.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Facility ─────────────────────────────────────────────────────
        CreateMap<Facilities, FacilityResponse>();
        CreateMap<CreateFacilityRequest, Facilities>();
        CreateMap<UpdateFacilityRequest, Facilities>();

        // ── Area ─────────────────────────────────────────────────────────
        CreateMap<Areas, AreaResponse>();
        CreateMap<CreateAreaRequest, Areas>();
        CreateMap<UpdateAreaRequest, Areas>();

        // ── Court ────────────────────────────────────────────────────────
        CreateMap<Courts, CourtResponse>();
        CreateMap<CreateCourtRequest, Courts>();
        CreateMap<UpdateCourtRequest, Courts>();

        // ── CourtType ────────────────────────────────────────────────────
        CreateMap<CourtTypes, CourtTypeResponse>();
        CreateMap<CreateCourtTypeRequest, CourtTypes>();
        CreateMap<UpdateCourtTypeRequest, CourtTypes>();

        // ── CourtStatus ──────────────────────────────────────────────────
        CreateMap<CourtStatus, CourtStatusResponse>();
        CreateMap<CreateCourtStatusRequest, CourtStatus>();
        CreateMap<UpdateCourtStatusRequest, CourtStatus>();

        CreateMap<CourtFeatures, CourtFeatureResponse>();
        CreateMap<CreateCourtFeatureRequest, CourtFeatures>();
        CreateMap<UpdateCourtFeatureRequest, CourtFeatures>();

        // ── Utility ──────────────────────────────────────────────────────
        CreateMap<Utilities, UtilityResponse>();
        CreateMap<CreateUtilityRequest, Utilities>();
        CreateMap<UpdateUtilityRequest, Utilities>();

        // ── TimeSlot ─────────────────────────────────────────────────────
        CreateMap<TimeSlots, TimeSlotResponse>();
        CreateMap<CreateTimeSlotRequest, TimeSlots>();
        CreateMap<UpdateTimeSlotRequest, TimeSlots>();

        // ── CourtPriceByTimeSlot ─────────────────────────────────────────
        CreateMap<CourtPriceByTimeSlot, CourtPriceResponse>();
        CreateMap<CreateCourtPriceRequest, CourtPriceByTimeSlot>();
        CreateMap<UpdateCourtPriceRequest, CourtPriceByTimeSlot>();

        // ── Customer ─────────────────────────────────────────────────────
        CreateMap<Customers, CustomerResponse>();
        CreateMap<CreateCustomerRequest, Customers>();
        CreateMap<UpdateCustomerRequest, Customers>();

        // ── Booking ──────────────────────────────────────────────────────
        CreateMap<Bookings, BookingResponse>();
        CreateMap<CreateBookingRequest, Bookings>();
        CreateMap<UpdateBookingRequest, Bookings>();

        // ── Service ──────────────────────────────────────────────────────
        CreateMap<Domain.Entities.Services, ServiceResponse>();
        CreateMap<CreateServiceRequest, Domain.Entities.Services>();
        CreateMap<UpdateServiceRequest, Domain.Entities.Services>();

        // ── Payment ──────────────────────────────────────────────────────
        CreateMap<Payments, PaymentResponse>();
        CreateMap<CreatePaymentRequest, Payments>();
        CreateMap<UpdatePaymentRequest, Payments>();

        // ── CourtAreaMapping ─────────────────────────────────────────────
        CreateMap<CourtAreaMapping, CourtAreaMappingResponse>();
        CreateMap<CreateCourtAreaMappingRequest, CourtAreaMapping>();
        CreateMap<UpdateCourtAreaMappingRequest, CourtAreaMapping>();

        // ── CourtUtilities ───────────────────────────────────────────────
        CreateMap<CourtUtilities, CourtUtilityResponse>();
        CreateMap<CreateCourtUtilityRequest, CourtUtilities>();

        // ── BookingSlots ─────────────────────────────────────────────────
        CreateMap<BookingSlots, BookingSlotResponse>();
        CreateMap<CreateBookingSlotRequest, BookingSlots>();

        // ── BookingServices ──────────────────────────────────────────────
        CreateMap<BookingServices, BookingServiceResponse>();
        CreateMap<CreateBookingServiceRequest, BookingServices>();
        CreateMap<UpdateBookingServiceRequest, BookingServices>();

        // ── ServicePrice ─────────────────────────────────────────────────
        CreateMap<ServicePrice, ServicePriceResponse>();
        CreateMap<CreateServicePriceRequest, ServicePrice>();
        CreateMap<UpdateServicePriceRequest, ServicePrice>();

        // ── CourtPriceHistory (read-only) ────────────────────────────────
        CreateMap<CourtPriceHistory, CourtPriceHistoryResponse>();
    }
}
