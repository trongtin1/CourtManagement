import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from '@/layouts/components/Sidebar'
import HeaderBar from '@/layouts/components/HeaderBar'
import React from 'react'

const { Content } = Layout

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) {
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
    <Layout className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        toggleCollapsed={toggleCollapsed}
      />
      <Layout
        className={`transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-62.5'
        } ${isMobile ? 'ml-0' : ''}`}
      >
        <HeaderBar
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          isMobile={isMobile}
        />
        <Content
          className="m-6 p-6 bg-white rounded-lg shadow-sm"
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
