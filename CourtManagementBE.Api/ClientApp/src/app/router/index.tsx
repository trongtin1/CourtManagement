import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/constants/routes'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import {
  AreasPage,
  AssetCategoriesPage,
  AssetConditionsPage,
  BookingStatusesPage,
  BookingsPage,
  CombosPage,
  CancellationReasonsPage,
  CourtAssetsPage,
  CourtFeatureCategoriesPage,
  CourtFeaturesPage,
  CourtPriceSettingPage,
  CourtSettingsPage,
  CourtStatusesPage,
  CourtTypesPage,
  CourtsPage,
  CustomerTypesPage,
  CustomersPage,
  DashboardPage,
  FacilitiesPage,
  LoginPage,
  MasterDataHubPage,
  NotFoundPage,
  PaymentMethodsPage,
  PaymentStatusesPage,
  PaymentsPage,
  PriceRuleTypesPage,
  RefundReasonsPage,
  SelectFacilityPage,
  ServiceTypesPage,
  ServicesPage,
  TimeSlotsPage,
  UnitsPage,
  UtilitiesPage,
  BookingHistoriesPage,
  SystemSettingsPage,
} from '@/app/router/lazyPages'

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.selectFacility,
    element: <ProtectedRoute>{withSuspense(<SelectFacilityPage />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.courtSettings,
    element: <ProtectedRoute>{withSuspense(<CourtSettingsPage />)}</ProtectedRoute>,
  },
  {
    path: ROUTES.root,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      {
        path: ROUTES.dashboard.replace('/', ''),
        element: withSuspense(<DashboardPage />),
      },
      {
        path: ROUTES.facilities.replace('/', ''),
        element: withSuspense(<FacilitiesPage />),
      },
      { path: ROUTES.areas.replace('/', ''), element: withSuspense(<AreasPage />) },
      { path: ROUTES.courts.replace('/', ''), element: withSuspense(<CourtsPage />) },
      {
        path: ROUTES.courtPriceSetting.replace('/', ''),
        element: withSuspense(<CourtPriceSettingPage />),
      },
      {
        path: ROUTES.priceRuleTypes.replace('/', ''),
        element: withSuspense(<PriceRuleTypesPage />),
      },
      {
        path: ROUTES.courtTypes.replace('/', ''),
        element: withSuspense(<CourtTypesPage />),
      },
      {
        path: ROUTES.courtStatuses.replace('/', ''),
        element: withSuspense(<CourtStatusesPage />),
      },
      {
        path: ROUTES.courtFeatures.replace('/', ''),
        element: withSuspense(<CourtFeaturesPage />),
      },
      {
        path: ROUTES.courtAssets.replace('/', ''),
        element: withSuspense(<CourtAssetsPage />),
      },
      {
        path: ROUTES.utilities.replace('/', ''),
        element: withSuspense(<UtilitiesPage />),
      },
      {
        path: ROUTES.timeSlots.replace('/', ''),
        element: withSuspense(<TimeSlotsPage />),
      },
      {
        path: ROUTES.customers.replace('/', ''),
        element: withSuspense(<CustomersPage />),
      },
      { path: ROUTES.bookings.replace('/', ''), element: withSuspense(<BookingsPage />) },
      {
        path: ROUTES.createBooking.replace('/', ''),
        element: withSuspense(<BookingsPage />),
      },
      { path: ROUTES.services.replace('/', ''), element: withSuspense(<ServicesPage />) },
      { path: ROUTES.combos.replace('/', ''), element: withSuspense(<CombosPage />) },
      { path: ROUTES.payments.replace('/', ''), element: withSuspense(<PaymentsPage />) },
      // ── Master Data ──────────────────────────────────────────────
      {
        path: ROUTES.masterDataHub.replace('/', ''),
        element: withSuspense(<MasterDataHubPage />),
      },
      {
        path: ROUTES.bookingStatuses.replace('/', ''),
        element: withSuspense(<BookingStatusesPage />),
      },
      {
        path: ROUTES.paymentStatuses.replace('/', ''),
        element: withSuspense(<PaymentStatusesPage />),
      },
      {
        path: ROUTES.paymentMethods.replace('/', ''),
        element: withSuspense(<PaymentMethodsPage />),
      },
      {
        path: ROUTES.customerTypes.replace('/', ''),
        element: withSuspense(<CustomerTypesPage />),
      },
      {
        path: ROUTES.serviceTypes.replace('/', ''),
        element: withSuspense(<ServiceTypesPage />),
      },
      { path: ROUTES.units.replace('/', ''), element: withSuspense(<UnitsPage />) },
      {
        path: ROUTES.assetCategories.replace('/', ''),
        element: withSuspense(<AssetCategoriesPage />),
      },
      {
        path: ROUTES.assetConditions.replace('/', ''),
        element: withSuspense(<AssetConditionsPage />),
      },
      {
        path: ROUTES.courtFeatureCategories.replace('/', ''),
        element: withSuspense(<CourtFeatureCategoriesPage />),
      },
      {
        path: ROUTES.cancellationReasons.replace('/', ''),
        element: withSuspense(<CancellationReasonsPage />),
      },
      {
        path: ROUTES.refundReasons.replace('/', ''),
        element: withSuspense(<RefundReasonsPage />),
      },
      {
        path: ROUTES.bookingHistories.replace('/', ''),
        element: withSuspense(<BookingHistoriesPage />),
      },
      {
        path: ROUTES.systemSettings.replace('/', ''),
        element: withSuspense(<SystemSettingsPage />),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])
