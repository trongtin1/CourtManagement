import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from '@/layouts/components/Sidebar'
import HeaderBar from '@/layouts/components/HeaderBar'
import { pageMeta } from '@/layouts/components/AppMenu'
import React from 'react'

const { Content } = Layout

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const location = useLocation()
  const currentPath = location.pathname.split('/')[1] || 'dashboard'
  const currentPage = pageMeta[currentPath] ?? pageMeta.dashboard

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth <= 768
      setIsMobile(nextIsMobile)
      if (nextIsMobile) {
        setCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        toggleCollapsed={toggleCollapsed}
      />
      <Layout
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
        }}
      >
        <HeaderBar
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          isMobile={isMobile}
          title={currentPage.title}
          description={currentPage.description}
        />
        <Content
          className="mx-4 my-5 md:mx-6 md:my-6"
          style={{
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
