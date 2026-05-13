import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Avatar, Button, Layout, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { logout, selectCurrentUser } from '@/features/auth/model/authSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const { Header } = Layout

type HeaderBarProps = {
  collapsed: boolean
  onToggleSidebar: () => void
}

export function HeaderBar({ collapsed, onToggleSidebar }: HeaderBarProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logout())
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <Header
      className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 px-4 md:px-6"
      style={{ background: '#ffffff' }}
    >
      <Button
        aria-label="Toggle navigation"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleSidebar}
        type="text"
      />

      <Space size={16}>
        <Space>
          <Avatar>{user?.fullName?.[0] ?? 'U'}</Avatar>

          <div className="hidden flex-col leading-tight md:flex">
            <Typography.Text strong>{user?.fullName ?? 'User'}</Typography.Text>
            <Typography.Text type="secondary">
              {user?.email ?? 'Authenticated'}
            </Typography.Text>
          </div>
        </Space>

        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </Space>
    </Header>
  )
}
