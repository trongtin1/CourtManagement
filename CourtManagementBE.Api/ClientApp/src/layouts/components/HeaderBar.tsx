import { type FC } from 'react'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Typography, type MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { ROUTES } from '@/constants/routes'
import { logout } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/hooks/redux'
import { storage } from '@/utils/storage'

const { Header } = Layout

interface HeaderBarProps {
  collapsed: boolean
  toggleCollapsed: () => void
  isMobile: boolean
  title: string
  description: string
}

const HeaderBar: FC<HeaderBarProps> = ({
  collapsed,
  toggleCollapsed,
  title,
  description,
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '\u0110\u0103ng xu\u1ea5t',
      onClick: () => {
        dispatch(logout())
        storage.remove(AUTH_STORAGE_KEYS.workingFacilityId)
        storage.remove(AUTH_STORAGE_KEYS.workingFacility)
        navigate(ROUTES.login, { replace: true })
      },
    },
  ]

  return (
    <Header className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-slate-200 bg-white px-3 py-0 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className="h-10 w-10"
        />
        <div className="min-w-0">
          <Typography.Title className="mb-0! truncate text-xl! md:text-2xl!" level={2}>
            {title}
          </Typography.Title>
          <Typography.Text className="hidden text-slate-500! md:block">
            {description}
          </Typography.Text>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex cursor-pointer items-center">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            <span className="ml-2 hidden font-medium text-slate-700 md:inline">
              Admin
            </span>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default HeaderBar
