import { Link } from 'react-router-dom'
import {
  DashboardOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ToolOutlined,
  UserOutlined,
  CreditCardOutlined,
} from '@ant-design/icons'
import React from 'react'

export type MenuItem = {
  key: string
  icon?: React.ReactNode
  label: React.ReactNode | string
  children?: MenuItem[]
}

export const getMenuItems = (): MenuItem[] => {
  return [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'court-management',
      icon: <AppstoreOutlined />,
      label: 'Court Management',
      children: [
        {
          key: 'facilities',
          label: <Link to="/facilities">Facilities</Link>,
        },
        {
          key: 'areas',
          label: <Link to="/areas">Areas</Link>,
        },
        {
          key: 'courts',
          label: <Link to="/courts">Courts</Link>,
        },
        {
          key: 'court-types',
          label: <Link to="/court-types">Court Types</Link>,
        },
        {
          key: 'court-statuses',
          label: <Link to="/court-statuses">Court Statuses</Link>,
        },
        {
          key: 'court-features',
          label: <Link to="/court-features">Court Features</Link>,
        },
        {
          key: 'court-feature-mappings',
          label: <Link to="/court-feature-mappings">Court Feature Mappings</Link>,
        },
        {
          key: 'court-assets',
          label: <Link to="/court-assets">Court Assets</Link>,
        },
      ],
    },
    {
      key: 'booking-management',
      icon: <CalendarOutlined />,
      label: 'Booking Management',
      children: [
        {
          key: 'bookings',
          label: <Link to="/bookings">Bookings</Link>,
        },
        {
          key: 'time-slots',
          label: <Link to="/time-slots">Time Slots</Link>,
        },
      ],
    },
    {
      key: 'services-utilities',
      icon: <ToolOutlined />,
      label: 'Services & Utilities',
      children: [
        {
          key: 'services',
          label: <Link to="/services">Services</Link>,
        },
        {
          key: 'utilities',
          label: <Link to="/utilities">Utilities</Link>,
        },
      ],
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: <Link to="/payments">Payments</Link>,
    },
  ]
}

export default getMenuItems
