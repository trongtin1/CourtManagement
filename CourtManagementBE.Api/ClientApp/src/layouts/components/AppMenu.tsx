import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  PartitionOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

const menuItems: NonNullable<MenuProps['items']> = [
  { key: ROUTES.dashboard, icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'system',
    icon: <BankOutlined />,
    label: 'He thong',
    children: [
      { key: ROUTES.facilities, icon: <EnvironmentOutlined />, label: 'Co so' },
      { key: ROUTES.areas, icon: <PartitionOutlined />, label: 'Khu vuc' },
    ],
  },
  {
    key: 'courts',
    icon: <TrophyOutlined />,
    label: 'Quan ly san',
    children: [
      { key: ROUTES.courts, icon: <TrophyOutlined />, label: 'Danh sach san' },
      { key: ROUTES.courtTypes, icon: <TagsOutlined />, label: 'Loai san' },
      { key: ROUTES.courtStatuses, icon: <CheckCircleOutlined />, label: 'Trang thai san' },
      { key: ROUTES.courtFeatures, icon: <TagsOutlined />, label: 'Dac diem san' },
      { key: ROUTES.utilities, icon: <ToolOutlined />, label: 'Tien ich' },
      { key: ROUTES.timeSlots, icon: <ClockCircleOutlined />, label: 'Khung gio' },
    ],
  },
  {
    key: 'booking',
    icon: <CalendarOutlined />,
    label: 'Khach & dat san',
    children: [
      { key: ROUTES.customers, icon: <TeamOutlined />, label: 'Khach hang' },
      { key: ROUTES.bookings, icon: <CalendarOutlined />, label: 'Dat san' },
    ],
  },
  {
    key: 'commerce',
    icon: <CreditCardOutlined />,
    label: 'Dich vu & thu tien',
    children: [
      { key: ROUTES.services, icon: <ToolOutlined />, label: 'Dich vu' },
      { key: ROUTES.payments, icon: <CreditCardOutlined />, label: 'Thanh toan' },
    ],
  },
]

const routeKeys = [
  ROUTES.dashboard,
  ROUTES.facilities,
  ROUTES.areas,
  ROUTES.courts,
  ROUTES.courtTypes,
  ROUTES.courtStatuses,
  ROUTES.courtFeatures,
  ROUTES.utilities,
  ROUTES.timeSlots,
  ROUTES.customers,
  ROUTES.bookings,
  ROUTES.services,
  ROUTES.payments,
]

export function AppMenu() {
  const location = useLocation()
  const navigate = useNavigate()
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const selectedKeys = useMemo(() => {
    const matched = routeKeys.find(
      (key) => location.pathname === key || location.pathname.startsWith(`${key}/`),
    )
    return matched ? [matched] : [ROUTES.dashboard]
  }, [location.pathname])

  const routeOpenKeys = useMemo(() => {
    const [selectedKey] = selectedKeys
    return menuItems
      .filter(
        (item) =>
          item &&
          'children' in item &&
          item.children?.some((child) => child?.key === selectedKey),
      )
      .map((item) => String(item?.key))
  }, [selectedKeys])

  useEffect(() => {
    setOpenKeys((current) => Array.from(new Set([...current, ...routeOpenKeys])))
  }, [routeOpenKeys])

  return (
    <Menu
      items={menuItems}
      mode="inline"
      onClick={({ key }) => {
        if (key.startsWith('/')) navigate(key)
      }}
      onOpenChange={(keys) => setOpenKeys(keys)}
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      theme="dark"
    />
  )
}
