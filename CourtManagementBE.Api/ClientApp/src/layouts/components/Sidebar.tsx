import { Layout, Menu, Drawer } from 'antd'
import { useLocation } from 'react-router-dom'
import { getMenuItems } from './AppMenu'
import React from 'react'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
  isMobile: boolean
  toggleCollapsed: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, isMobile, toggleCollapsed }) => {
  const location = useLocation()
  const menuItems = getMenuItems()

  const pathParts = location.pathname.split('/')
  const currentPath = pathParts[1] || 'dashboard'
  const findOpenKeys = () => {
    for (const item of menuItems) {
      if (item.children) {
        const childKey = item.children.find((child) => child.key === currentPath)
        if (childKey) return [item.key]
      }
    }
    return []
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-center border-b border-slate-100 px-4 py-5">
        <h1
          className={`font-bold tracking-wide text-blue-600 transition-opacity duration-300 ${
            collapsed ? 'opacity-0 w-0' : 'opacity-100'
          }`}
        >
          Court Admin
        </h1>
        {collapsed && <span className="text-2xl font-bold text-blue-600">CA</span>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        defaultOpenKeys={findOpenKeys()}
        items={menuItems}
        className="border-r-0 px-2 py-3"
      />
    </>
  )

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={!collapsed}
        onClose={toggleCollapsed}
        width={250}
        styles={{ body: { padding: 0 } }}
      >
        {sidebarContent}
      </Drawer>
    )
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      className="shadow-md"
      width={250}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {sidebarContent}
    </Sider>
  )
}

export default Sidebar
