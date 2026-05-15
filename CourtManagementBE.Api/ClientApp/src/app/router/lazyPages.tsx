import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

export const LoginPage = lazy(() =>
  import('@/pages/login/LoginPage').then((m) => ({ default: m.LoginPage })),
)

export const NotFoundPage = lazy(() =>
  import('@/pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export const FacilitiesPage = lazy(() =>
  import('@/pages/facilities/FacilitiesPage').then((m) => ({ default: m.FacilitiesPage })),
)

export const AreasPage = lazy(() =>
  import('@/pages/areas/AreasPage').then((m) => ({ default: m.AreasPage })),
)

export const CourtsPage = lazy(() =>
  import('@/pages/courts/CourtsPage').then((m) => ({ default: m.CourtsPage })),
)

export const CourtTypesPage = lazy(() =>
  import('@/pages/court-types/CourtTypesPage').then((m) => ({ default: m.CourtTypesPage })),
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

export const CourtFeatureMappingsPage = lazy(() =>
  import('@/pages/court-feature-mappings/CourtFeatureMappingsPage').then((m) => ({
    default: m.CourtFeatureMappingsPage,
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

export const PaymentsPage = lazy(() =>
  import('@/pages/payments/PaymentsPage').then((m) => ({ default: m.PaymentsPage })),
)
