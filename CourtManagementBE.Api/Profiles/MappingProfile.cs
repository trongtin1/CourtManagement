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
        CreateMap<CourtFeatureMappings, CourtFeatureMappingResponse>();
        CreateMap<CreateCourtFeatureMappingRequest, CourtFeatureMappings>();
        CreateMap<CourtAssets, CourtAssetResponse>();
        CreateMap<CreateCourtAssetRequest, CourtAssets>();
        CreateMap<UpdateCourtAssetRequest, CourtAssets>();

        // ── Utility ──────────────────────────────────────────────────────
        CreateMap<Utilities, UtilityResponse>();
        CreateMap<CreateUtilityRequest, Utilities>();
        CreateMap<UpdateUtilityRequest, Utilities>();

        // ── TimeSlot ─────────────────────────────────────────────────────
        CreateMap<PriceRuleTypes, PriceRuleTypeResponse>();
        CreateMap<CreatePriceRuleTypeRequest, PriceRuleTypes>();
        CreateMap<UpdatePriceRuleTypeRequest, PriceRuleTypes>();

        // ── CourtPriceByTimeSlot ─────────────────────────────────────────
        CreateMap<CourtDefaultPriceRule, CourtDefaultPriceRuleResponse>();
        CreateMap<CourtDefaultPriceRuleRequest, CourtDefaultPriceRule>();

        CreateMap<CourtPriceRule, CourtPriceResponse>();
        CreateMap<CreateCourtPriceRequest, CourtPriceRule>();
        CreateMap<UpdateCourtPriceRequest, CourtPriceRule>();

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
        CreateMap<CourtPriceRuleHistory, CourtPriceHistoryResponse>();

        // ── Master Data ──────────────────────────────────────────────────
        CreateMap<BookingStatuses, BookingStatusResponse>();
        CreateMap<CreateBookingStatusRequest, BookingStatuses>();
        CreateMap<UpdateBookingStatusRequest, BookingStatuses>();

        CreateMap<PaymentStatuses, PaymentStatusResponse>();
        CreateMap<CreatePaymentStatusRequest, PaymentStatuses>();
        CreateMap<UpdatePaymentStatusRequest, PaymentStatuses>();

        CreateMap<PaymentMethods, PaymentMethodResponse>();
        CreateMap<CreatePaymentMethodRequest, PaymentMethods>();
        CreateMap<UpdatePaymentMethodRequest, PaymentMethods>();

        CreateMap<CustomerTypes, CustomerTypeResponse>();
        CreateMap<CreateCustomerTypeRequest, CustomerTypes>();
        CreateMap<UpdateCustomerTypeRequest, CustomerTypes>();

        CreateMap<ServiceTypes, ServiceTypeResponse>();
        CreateMap<CreateServiceTypeRequest, ServiceTypes>();
        CreateMap<UpdateServiceTypeRequest, ServiceTypes>();

        CreateMap<Units, UnitResponse>();
        CreateMap<CreateUnitRequest, Units>();
        CreateMap<UpdateUnitRequest, Units>();

        CreateMap<AssetCategories, AssetCategoryResponse>();
        CreateMap<CreateAssetCategoryRequest, AssetCategories>();
        CreateMap<UpdateAssetCategoryRequest, AssetCategories>();

        CreateMap<AssetConditions, AssetConditionResponse>();
        CreateMap<CreateAssetConditionRequest, AssetConditions>();
        CreateMap<UpdateAssetConditionRequest, AssetConditions>();

        CreateMap<CourtFeatureCategories, CourtFeatureCategoryResponse>();
        CreateMap<CreateCourtFeatureCategoryRequest, CourtFeatureCategories>();
        CreateMap<UpdateCourtFeatureCategoryRequest, CourtFeatureCategories>();

        CreateMap<CancellationReasons, CancellationReasonResponse>();
        CreateMap<CreateCancellationReasonRequest, CancellationReasons>();
        CreateMap<UpdateCancellationReasonRequest, CancellationReasons>();

        CreateMap<RefundReasons, RefundReasonResponse>();
        CreateMap<CreateRefundReasonRequest, RefundReasons>();
        CreateMap<UpdateRefundReasonRequest, RefundReasons>();
    }
}
