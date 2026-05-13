import { Layout, Typography } from 'antd'

import { AppMenu } from '@/layouts/components/AppMenu'

const { Sider } = Layout

type SidebarProps = {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <Sider
      className="z-20 overflow-auto"
      collapsed={collapsed}
      collapsedWidth={80}
      collapsible
      style={{
        position: 'fixed',
        insetBlockStart: 0,
        insetBlockEnd: 0,
        insetInlineStart: 0,
        height: '100vh',
        background: '#001529',
      }}
      trigger={null}
      width={260}
    >
      <div className="flex h-16 items-center gap-3 px-5 text-white">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-600 font-extrabold text-white">
          CM
        </div>

        {!collapsed && (
          <div>
            <Typography.Text className="block leading-tight text-white!">
              Court Management
            </Typography.Text>
            <Typography.Text className="block text-xs leading-tight text-slate-400!">
              Operations
            </Typography.Text>
          </div>
        )}
      </div>

      <AppMenu />
    </Sider>
  )
}
