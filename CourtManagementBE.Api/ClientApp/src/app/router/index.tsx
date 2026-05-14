import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/constants/routes'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import {
  BookingsPage,
  CourtFeaturesPage,
  CourtStatusesPage,
  CourtTypesPage,
  CourtsPage,
  CustomersPage,
  DashboardPage,
  FacilitiesPage,
  LoginPage,
  NotFoundPage,
  PaymentsPage,
  ServicesPage,
  TimeSlotsPage,
  UtilitiesPage,
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
    path: ROUTES.root,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      { path: ROUTES.dashboard.replace('/', ''), element: withSuspense(<DashboardPage />) },
      { path: ROUTES.facilities.replace('/', ''), element: withSuspense(<FacilitiesPage />) },
      { path: ROUTES.courts.replace('/', ''), element: withSuspense(<CourtsPage />) },
      { path: ROUTES.courtTypes.replace('/', ''), element: withSuspense(<CourtTypesPage />) },
      { path: ROUTES.courtStatuses.replace('/', ''), element: withSuspense(<CourtStatusesPage />) },
      { path: ROUTES.courtFeatures.replace('/', ''), element: withSuspense(<CourtFeaturesPage />) },
      { path: ROUTES.utilities.replace('/', ''), element: withSuspense(<UtilitiesPage />) },
      { path: ROUTES.timeSlots.replace('/', ''), element: withSuspense(<TimeSlotsPage />) },
      { path: ROUTES.customers.replace('/', ''), element: withSuspense(<CustomersPage />) },
      { path: ROUTES.bookings.replace('/', ''), element: withSuspense(<BookingsPage />) },
      { path: ROUTES.services.replace('/', ''), element: withSuspense(<ServicesPage />) },
      { path: ROUTES.payments.replace('/', ''), element: withSuspense(<PaymentsPage />) },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])
