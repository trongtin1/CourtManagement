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

export const TenantsPage = lazy(() =>
  import('@/pages/tenants/TenantsPage').then((m) => ({ default: m.TenantsPage })),
)

export const FacilitiesPage = lazy(() =>
  import('@/pages/facilities/FacilitiesPage').then((m) => ({ default: m.FacilitiesPage })),
)

export const CourtsPage = lazy(() =>
  import('@/pages/courts/CourtsPage').then((m) => ({ default: m.CourtsPage })),
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
