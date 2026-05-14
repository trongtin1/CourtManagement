import {
  BankOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

const menuItems = [
  { key: ROUTES.dashboard, icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: ROUTES.tenants, icon: <BankOutlined />, label: 'Tenants' },
  { key: ROUTES.facilities, icon: <EnvironmentOutlined />, label: 'Co so' },
  { key: ROUTES.courts, icon: <TrophyOutlined />, label: 'San' },
  { key: ROUTES.courtFeatures, icon: <TagsOutlined />, label: 'Dac diem san' },
  { key: ROUTES.customers, icon: <TeamOutlined />, label: 'Khach hang' },
  { key: ROUTES.bookings, icon: <CalendarOutlined />, label: 'Dat san' },
  { key: ROUTES.services, icon: <ToolOutlined />, label: 'Dich vu' },
  { key: ROUTES.payments, icon: <CreditCardOutlined />, label: 'Thanh toan' },
]

export function AppMenu() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedKeys = useMemo(() => {
    const matched = menuItems.find((item) => location.pathname.startsWith(item.key))
    return matched ? [matched.key] : [ROUTES.dashboard]
  }, [location.pathname])

  return (
    <Menu
      items={menuItems.map((item) => ({
        ...item,
        onClick: () => navigate(item.key),
      }))}
      mode="inline"
      selectedKeys={selectedKeys}
      theme="dark"
    />
  )
}
