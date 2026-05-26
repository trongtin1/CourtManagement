import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

export const LoginPage = lazy(() =>
  import('@/pages/login/LoginPage').then((m) => ({ default: m.LoginPage })),
)

export const SelectFacilityPage = lazy(() =>
  import('@/pages/select-facility/SelectFacilityPage').then((m) => ({
    default: m.SelectFacilityPage,
  })),
)

export const NotFoundPage = lazy(() =>
  import('@/pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export const FacilitiesPage = lazy(() =>
  import('@/pages/facilities/FacilitiesPage').then((m) => ({
    default: m.FacilitiesPage,
  })),
)

export const AreasPage = lazy(() =>
  import('@/pages/areas/AreasPage').then((m) => ({ default: m.AreasPage })),
)

export const CourtsPage = lazy(() =>
  import('@/pages/courts/CourtsPage').then((m) => ({ default: m.CourtsPage })),
)

export const CourtSettingsPage = lazy(() =>
  import('@/pages/courts/court-settings').then((m) => ({ default: m.default })),
)

export const CourtPriceSettingPage = lazy(() =>
  import('@/pages/court-price-setting').then((m) => ({ default: m.default })),
)

export const PriceRuleTypesPage = lazy(() =>
  import('@/pages/price-rule-types/PriceRuleTypesPage').then((m) => ({
    default: m.PriceRuleTypesPage,
  })),
)

export const CourtTypesPage = lazy(() =>
  import('@/pages/court-types/CourtTypesPage').then((m) => ({
    default: m.CourtTypesPage,
  })),
)

export const CourtStatusesPage = lazy(() =>
  import('@/pages/court-statuses/CourtStatusesPage').then((m) => ({
    default: m.CourtStatusesPage,
  })),
)

export const CourtFeaturesPage = lazy(() =>
  import('@/pages/court-features/CourtFeaturesPage').then((m) => ({
    default: m.CourtFeaturesPage,
  })),
)

export const CourtAssetsPage = lazy(() =>
  import('@/pages/court-assets/CourtAssetsPage').then((m) => ({
    default: m.CourtAssetsPage,
  })),
)

export const UtilitiesPage = lazy(() =>
  import('@/pages/utilities/UtilitiesPage').then((m) => ({ default: m.UtilitiesPage })),
)

export const TimeSlotsPage = lazy(() =>
  import('@/pages/time-slots/TimeSlotsPage').then((m) => ({ default: m.TimeSlotsPage })),
)

export const CustomersPage = lazy(() =>
  import('@/pages/customers/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)

export const BookingsPage = lazy(() =>
  import('@/pages/bookings/BookingsPage').then((m) => ({ default: m.BookingsPage })),
)

export const ServicesPage = lazy(() =>
  import('@/pages/services/ServicesPage').then((m) => ({ default: m.ServicesPage })),
)

export const CombosPage = lazy(() =>
  import('@/pages/combos/CombosPage').then((m) => ({ default: m.CombosPage })),
)

export const PaymentsPage = lazy(() =>
  import('@/pages/payments/PaymentsPage').then((m) => ({ default: m.PaymentsPage })),
)

// ── Master Data Pages ────────────────────────────────────────────────
export const MasterDataHubPage = lazy(() =>
  import('@/pages/master-data-hub/MasterDataHubPage').then((m) => ({
    default: m.MasterDataHubPage,
  })),
)

export const BookingStatusesPage = lazy(() =>
  import('@/pages/booking-statuses/BookingStatusesPage').then((m) => ({
    default: m.BookingStatusesPage,
  })),
)

export const PaymentStatusesPage = lazy(() =>
  import('@/pages/payment-statuses/PaymentStatusesPage').then((m) => ({
    default: m.PaymentStatusesPage,
  })),
)

export const PaymentMethodsPage = lazy(() =>
  import('@/pages/payment-methods/PaymentMethodsPage').then((m) => ({
    default: m.PaymentMethodsPage,
  })),
)

export const CustomerTypesPage = lazy(() =>
  import('@/pages/customer-types/CustomerTypesPage').then((m) => ({
    default: m.CustomerTypesPage,
  })),
)

export const ServiceTypesPage = lazy(() =>
  import('@/pages/service-types/ServiceTypesPage').then((m) => ({
    default: m.ServiceTypesPage,
  })),
)

export const UnitsPage = lazy(() =>
  import('@/pages/units/UnitsPage').then((m) => ({ default: m.UnitsPage })),
)

export const AssetCategoriesPage = lazy(() =>
  import('@/pages/asset-categories/AssetCategoriesPage').then((m) => ({
    default: m.AssetCategoriesPage,
  })),
)

export const AssetConditionsPage = lazy(() =>
  import('@/pages/asset-conditions/AssetConditionsPage').then((m) => ({
    default: m.AssetConditionsPage,
  })),
)

export const CourtFeatureCategoriesPage = lazy(() =>
  import('@/pages/court-feature-categories/CourtFeatureCategoriesPage').then((m) => ({
    default: m.CourtFeatureCategoriesPage,
  })),
)

export const CancellationReasonsPage = lazy(() =>
  import('@/pages/cancellation-reasons/CancellationReasonsPage').then((m) => ({
    default: m.CancellationReasonsPage,
  })),
)

export const RefundReasonsPage = lazy(() =>
  import('@/pages/refund-reasons/RefundReasonsPage').then((m) => ({
    default: m.RefundReasonsPage,
  })),
)
