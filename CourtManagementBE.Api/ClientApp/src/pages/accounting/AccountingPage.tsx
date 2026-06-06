import { Tabs } from 'antd'
import {
  // DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  BankOutlined,
  WalletOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  // BarChartOutlined,
} from '@ant-design/icons'

// import { AccountingDashboard } from './components/AccountingDashboard'
import { AccountingJournal } from './components/AccountingJournal'
import { AccountingVouchers } from './components/AccountingVouchers'
import { AccountingAccounts } from './components/AccountingAccounts'
import { AccountingCash } from './components/AccountingCash'
import { AccountingReceivables } from './components/AccountingReceivables'
import { AccountingPayables } from './components/AccountingPayables'
import { AccountingRules } from './components/AccountingRules'
// import { AccountingReports } from './components/AccountingReports'

export function AccountingPage() {
  return (
    <div className="flex flex-col gap-4 font-sans bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <Tabs
        defaultActiveKey="journal"
        className="w-full"
        tabBarStyle={{ marginBottom: 16, borderBottom: '1px solid #f1f5f9' }}
        tabBarGutter={24}
        items={[
          /*
          {
            key: 'dashboard',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <DashboardOutlined /> Tổng quan
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingDashboard />
              </div>
            ),
          },
          */
          {
            key: 'journal',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <BookOutlined /> Nhật ký
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingJournal />
              </div>
            ),
          },
          {
            key: 'vouchers',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <FileTextOutlined /> Chứng từ
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingVouchers />
              </div>
            ),
          },
          {
            key: 'accounts',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <BankOutlined /> Danh mục TK
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingAccounts />
              </div>
            ),
          },
          {
            key: 'cash',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <WalletOutlined /> Sổ quỹ
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingCash />
              </div>
            ),
          },
          {
            key: 'receivables',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <TeamOutlined /> Công nợ KH
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingReceivables />
              </div>
            ),
          },
          {
            key: 'payables',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <ShopOutlined /> Công nợ NCC
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingPayables />
              </div>
            ),
          },
          {
            key: 'rules',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <SettingOutlined /> Quy tắc
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingRules />
              </div>
            ),
          },
          /*
          {
            key: 'reports',
            label: (
              <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                <BarChartOutlined /> Báo cáo
              </span>
            ),
            children: (
              <div className="pt-2">
                <AccountingReports />
              </div>
            ),
          },
          */
        ]}
      />
    </div>
  )
}
