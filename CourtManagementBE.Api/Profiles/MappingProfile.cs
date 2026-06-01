using AutoMapper;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.DTOs.Response;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Api.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Facility ─────────────────────────────────────────────────────
        CreateMap<Facilities, FacilityResponse>();
        CreateMap<FacilityRequest, Facilities>();

        // ── Area ─────────────────────────────────────────────────────────
        CreateMap<Areas, AreaResponse>();
        CreateMap<AreaRequest, Areas>();

        // ── Court ────────────────────────────────────────────────────────
        CreateMap<Courts, CourtResponse>();
        CreateMap<CourtRequest, Courts>();

        // ── CourtType ────────────────────────────────────────────────────
        CreateMap<CourtTypes, CourtTypeResponse>();
        CreateMap<CourtTypeRequest, CourtTypes>();

        // ── CourtStatus ──────────────────────────────────────────────────
        CreateMap<CourtStatus, CourtStatusResponse>();
        CreateMap<CourtStatusRequest, CourtStatus>();

        CreateMap<CourtFeatures, CourtFeatureResponse>();
        CreateMap<CourtFeatureRequest, CourtFeatures>();
        CreateMap<CourtFeatureMappings, CourtFeatureMappingResponse>();
        CreateMap<CourtFeatureMappingRequest, CourtFeatureMappings>();
        CreateMap<CourtAssets, CourtAssetResponse>();
        CreateMap<CourtAssetRequest, CourtAssets>();

        // ── Utility ──────────────────────────────────────────────────────
        CreateMap<Utilities, UtilityResponse>();
        CreateMap<UtilityRequest, Utilities>();

        // ── TimeSlot ─────────────────────────────────────────────────────
        CreateMap<PriceRuleTypes, PriceRuleTypeResponse>();
        CreateMap<PriceRuleTypeRequest, PriceRuleTypes>();

        // ── CourtPriceByTimeSlot ─────────────────────────────────────────
        CreateMap<CourtDefaultPriceRule, CourtDefaultPriceRuleResponse>();
        CreateMap<CourtDefaultPriceRuleRequest, CourtDefaultPriceRule>();

        CreateMap<CourtLockedSlot, CourtLockedSlotResponse>();
        CreateMap<CourtLockedSlotRequest, CourtLockedSlot>();

        CreateMap<CourtPriceRule, CourtPriceResponse>();
        CreateMap<CourtPriceRequest, CourtPriceRule>();

        // ── Customer ─────────────────────────────────────────────────────
        CreateMap<Customers, CustomerResponse>();
        CreateMap<CustomerRequest, Customers>();

        // ── Booking ──────────────────────────────────────────────────────
        CreateMap<Bookings, BookingResponse>();
        CreateMap<BookingRequest, Bookings>();
        CreateMap<BookingGroups, BookingGroupResponse>();
        CreateMap<BookingGroupRequest, BookingGroups>();
        CreateMap<RecurringConfigs, RecurringConfigResponse>();
        CreateMap<RecurringConfigRequest, RecurringConfigs>();
        CreateMap<BookingHistories, BookingHistoryResponse>();

        // ── Service ──────────────────────────────────────────────────────
        CreateMap<Domain.Entities.Services, ServiceResponse>();
        CreateMap<ServiceRequest, Domain.Entities.Services>();

        // ── Payment ──────────────────────────────────────────────────────
        CreateMap<Payments, PaymentResponse>();
        CreateMap<PaymentRequest, Payments>();

        // ── CourtAreaMapping ─────────────────────────────────────────────
        CreateMap<CourtAreaMapping, CourtAreaMappingResponse>();
        CreateMap<CourtAreaMappingRequest, CourtAreaMapping>();

        // ── CourtUtilities ───────────────────────────────────────────────
        CreateMap<CourtUtilities, CourtUtilityResponse>();
        CreateMap<CourtUtilityRequest, CourtUtilities>();

        // ── BookingSlots ─────────────────────────────────────────────────
        CreateMap<BookingSlots, BookingSlotResponse>();
        CreateMap<BookingSlotRequest, BookingSlots>();

        // ── BookingServices ──────────────────────────────────────────────
        CreateMap<BookingServices, BookingServiceResponse>();
        CreateMap<BookingServiceRequest, BookingServices>();
        CreateMap<UpdateBookingServiceRequest, BookingServices>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ── BookingCombos ────────────────────────────────────────────────
        CreateMap<BookingCombos, BookingComboResponse>();
        CreateMap<BookingComboRequest, BookingCombos>();
        CreateMap<UpdateBookingComboRequest, BookingCombos>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));



        // ── Combos & ComboServices ───────────────────────────────────────
        CreateMap<Combos, ComboResponse>();
        CreateMap<ComboRequest, Combos>();
        CreateMap<ComboServices, ComboServiceResponse>();
        CreateMap<ComboServiceRequest, ComboServices>();

        // ── CourtPriceHistory (read-only) ────────────────────────────────
        CreateMap<CourtPriceRuleHistory, CourtPriceHistoryResponse>();

        // ── Master Data ──────────────────────────────────────────────────
        CreateMap<PaymentStatuses, PaymentStatusResponse>();
        CreateMap<PaymentStatusRequest, PaymentStatuses>();

        CreateMap<PaymentMethods, PaymentMethodResponse>();
        CreateMap<PaymentMethodRequest, PaymentMethods>();

        CreateMap<CustomerTypes, CustomerTypeResponse>();
        CreateMap<CustomerTypeRequest, CustomerTypes>();

        CreateMap<ServiceTypes, ServiceTypeResponse>();
        CreateMap<ServiceTypeRequest, ServiceTypes>();

        CreateMap<Units, UnitResponse>();
        CreateMap<UnitRequest, Units>();

        CreateMap<UnitConversions, UnitConversionResponse>()
            .ForMember(d => d.SourceUnitName, opt => opt.MapFrom(s => s.SourceUnit.Name))
            .ForMember(d => d.SourceUnitSymbol, opt => opt.MapFrom(s => s.SourceUnit.Symbol))
            .ForMember(d => d.TargetUnitName, opt => opt.MapFrom(s => s.TargetUnit.Name))
            .ForMember(d => d.TargetUnitSymbol, opt => opt.MapFrom(s => s.TargetUnit.Symbol));
        CreateMap<UnitConversionRequest, UnitConversions>();

        CreateMap<AssetCategories, AssetCategoryResponse>();
        CreateMap<AssetCategoryRequest, AssetCategories>();

        CreateMap<AssetConditions, AssetConditionResponse>();
        CreateMap<AssetConditionRequest, AssetConditions>();

        CreateMap<CourtFeatureCategories, CourtFeatureCategoryResponse>();
        CreateMap<CourtFeatureCategoryRequest, CourtFeatureCategories>();

        CreateMap<CancellationReasons, CancellationReasonResponse>();
        CreateMap<CancellationReasonRequest, CancellationReasons>();

        CreateMap<RefundReasons, RefundReasonResponse>();
        CreateMap<RefundReasonRequest, RefundReasons>();

        CreateMap<BookingStatuses, BookingStatusResponse>();
        CreateMap<BookingStatusRequest, BookingStatuses>();
    }
}
