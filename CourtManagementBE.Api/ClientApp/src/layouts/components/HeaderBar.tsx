import { Avatar, Button, Dropdown, Layout, type MenuProps } from 'antd'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { logout } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/hooks/redux'
import React from 'react'

const { Header } = Layout

interface HeaderBarProps {
  collapsed: boolean
  toggleCollapsed: () => void
  isMobile: boolean
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  collapsed,
  toggleCollapsed,
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        dispatch(logout())
        navigate(ROUTES.login, { replace: true })
      },
    },
  ]

  return (
    <Header className="p-0 bg-white shadow-sm flex items-center justify-between sticky top-0 z-50">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapsed}
        className="w-16 h-16"
      />
      <div className="flex items-center mr-6 gap-4">
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            {/* <span className="ml-2 font-medium hidden md:inline">
              Hello User
            </span> */}
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

export default HeaderBar
