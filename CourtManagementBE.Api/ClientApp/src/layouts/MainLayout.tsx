import { Layout } from 'antd'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { HeaderBar } from '@/layouts/components/HeaderBar'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { Sidebar } from '@/layouts/components/Sidebar'

const { Content } = Layout
const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 80
export function MainLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} />

      <Layout
        className="min-h-screen transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <HeaderBar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((value) => !value)}
        />

        <Content className="p-4 md:p-6">
          <PageBreadcrumb />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
