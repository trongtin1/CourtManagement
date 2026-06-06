import { Card, Col, Row, Statistic, Space, Tag, Table, Typography, Button } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  WalletOutlined,
  BankOutlined,
  TeamOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

const RECENT_ENTRIES = [
  {
    key: 'BT-08421',
    id: 'BT-08421',
    desc: 'Thu tiền sân CL-03',
    debit: '111',
    credit: '511',
    amount: 540000,
    time: 'vừa xong',
  },
  {
    key: 'BT-08420',
    id: 'BT-08420',
    desc: 'Thu cọc PK-01',
    debit: '111',
    credit: '131',
    amount: 200000,
    time: '8 phút',
  },
  {
    key: 'BT-08419',
    id: 'BT-08419',
    desc: 'Mua nước uống',
    debit: '156',
    credit: '111',
    amount: 1280000,
    time: '23 phút',
  },
  {
    key: 'BT-08418',
    id: 'BT-08418',
    desc: 'Hoàn cọc TN-02',
    debit: '131',
    credit: '111',
    amount: 150000,
    time: '1 giờ',
  },
  {
    key: 'BT-08417',
    id: 'BT-08417',
    desc: 'Thanh toán điện',
    debit: '642',
    credit: '112',
    amount: 4200000,
    time: '2 giờ',
  },
]

const UPCOMING_DEBTS = [
  { key: '1', name: 'FC Sài Gòn FC', dueIn: '3 ngày', amount: 4800000, urgency: 'danger' },
  { key: '2', name: 'CLB Phượng Hoàng', dueIn: '5 ngày', amount: 2400000, urgency: 'warning' },
  { key: '3', name: 'Anh Nguyễn Hữu Đức', dueIn: '6 ngày', amount: 1200000, urgency: 'warning' },
  { key: '4', name: 'Lê Minh Hoàng', dueIn: '7 ngày', amount: 860000, urgency: 'default' },
  { key: '5', name: 'Team Pickleball SG', dueIn: '7 ngày', amount: 3200000, urgency: 'default' },
]

const RECENT_EXPENSES = [
  { key: '1', name: 'Sửa hệ thống đèn LED', category: 'Bảo trì', amount: 8400000 },
  { key: '2', name: 'Mua thảm sân TN', category: 'Vật tư', amount: 12600000 },
  { key: '3', name: 'Tiền điện tháng 5', category: 'Vận hành', amount: 4200000 },
  { key: '4', name: 'Lương HLV cầu lông', category: 'Nhân sự', amount: 6800000 },
  { key: '5', name: 'Quảng cáo Facebook', category: 'Marketing', amount: 3200000 },
]

const BANK_ACCOUNTS = [
  { key: '1', bank: 'Vietcombank', acc: '•••• 4821', balance: 184200000, color: '#10b981' },
  { key: '2', bank: 'BIDV', acc: '•••• 7392', balance: 96400000, color: '#06b6d4' },
  { key: '3', bank: 'MB Bank', acc: '•••• 1024', balance: 82800000, color: '#8b5cf6' },
  { key: '4', bank: 'Techcombank', acc: '•••• 5560', balance: 49400000, color: '#f43f5e' },
]

const formatVND = (v: number) => v.toLocaleString('vi-VN') + '₫'

export function AccountingDashboard() {
  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Tổng quan kế toán</h2>
          <p className="text-xs text-slate-500 mb-0">Báo cáo nhanh tình hình tài chính, số dư quỹ và doanh thu phát sinh.</p>
        </div>
        <div className="shrink-0">
          <Button type="primary" icon={<DownloadOutlined />}>
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Doanh thu hôm nay"
              value="18.4M₫"
              prefix={<ArrowUpOutlined className="text-emerald-500" />}
              suffix={
                <Typography.Text type="success" className="text-xs!">
                  +12.3%
                </Typography.Text>
              }
            />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Doanh thu tháng"
              value="486.2M₫"
              prefix={<DollarOutlined className="text-blue-500" />}
              suffix={
                <Typography.Text type="success" className="text-xs!">
                  +18.4% MoM
                </Typography.Text>
              }
            />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Tổng chi phí"
              value="142.8M₫"
              prefix={<ArrowDownOutlined className="text-amber-500" />}
              suffix={
                <Typography.Text type="warning" className="text-xs!">
                  ↓ 2.1%
                </Typography.Text>
              }
            />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Lợi nhuận thuần" value="343.4M₫" suffix="Biên 70.6%" />
          </Card>
        </Col>
      </Row>

      {/* Secondary summary cards */}
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Phải thu KH"
              value="82.4M₫"
              prefix={<TeamOutlined className="text-blue-500" />}
            />
            <Typography.Text type="secondary" className="text-xs!">
              47 khách hàng
            </Typography.Text>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Phải trả NCC"
              value="48.6M₫"
              prefix={<WalletOutlined className="text-amber-500" />}
            />
            <Typography.Text type="secondary" className="text-xs!">
              12 nhà cung cấp
            </Typography.Text>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Tiền mặt"
              value="26.2M₫"
              prefix={<WalletOutlined className="text-emerald-500" />}
            />
            <Typography.Text type="secondary" className="text-xs!">
              3 quỹ
            </Typography.Text>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Ngân hàng"
              value="412.8M₫"
              prefix={<BankOutlined className="text-slate-500" />}
            />
            <Typography.Text type="secondary" className="text-xs!">
              4 tài khoản
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      {/* Detail tables */}
      <Row gutter={[16, 16]}>
        <Col lg={8} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Bút toán mới nhất"
            extra={<Tag>Tự động sinh</Tag>}
          >
            <Table
              columns={[
                {
                  title: 'Diễn giải',
                  dataIndex: 'desc',
                  render: (text: string, record: (typeof RECENT_ENTRIES)[number]) => (
                    <div>
                      <div className="font-medium text-sm">{text}</div>
                      <div className="text-xs text-slate-400">
                        {record.id} · Nợ {record.debit} / Có {record.credit} · {record.time}
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  align: 'right' as const,
                  render: (v: number) => (
                    <span className="font-semibold tabular-nums text-sm">
                      {formatVND(v)}
                    </span>
                  ),
                },
              ]}
              dataSource={RECENT_ENTRIES}
              pagination={false}
              size="small"
              showHeader={false}
            />
          </Card>
        </Col>
        <Col lg={8} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Công nợ sắp đến hạn"
            extra={<Tag color="warning">5 khoản</Tag>}
          >
            <Table
              columns={[
                {
                  title: 'Khách',
                  dataIndex: 'name',
                  render: (text: string, record: (typeof UPCOMING_DEBTS)[number]) => (
                    <div>
                      <div className="font-medium text-sm">{text}</div>
                      <div className="text-xs text-slate-400">Đến hạn trong {record.dueIn}</div>
                    </div>
                  ),
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  align: 'right' as const,
                  render: (v: number) => (
                    <span className="font-semibold tabular-nums text-sm">{formatVND(v)}</span>
                  ),
                },
              ]}
              dataSource={UPCOMING_DEBTS}
              pagination={false}
              size="small"
              showHeader={false}
            />
          </Card>
        </Col>
        <Col lg={8} xs={24}>
          <Card className="border-slate-200 shadow-sm" title="Khoản chi lớn gần đây" extra={<Tag>≥ 1M₫</Tag>}>
            <Table
              columns={[
                {
                  title: 'Tên',
                  dataIndex: 'name',
                  render: (text: string, record: (typeof RECENT_EXPENSES)[number]) => (
                    <div>
                      <div className="font-medium text-sm">{text}</div>
                      <div className="text-xs text-slate-400">{record.category}</div>
                    </div>
                  ),
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  align: 'right' as const,
                  render: (v: number) => (
                    <span className="font-semibold tabular-nums text-sm text-red-500">
                      -{formatVND(v)}
                    </span>
                  ),
                },
              ]}
              dataSource={RECENT_EXPENSES}
              pagination={false}
              size="small"
              showHeader={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Bank accounts */}
      <Card className="border-slate-200 shadow-sm" title="Số dư tài khoản">
        <Row gutter={[16, 16]}>
          {BANK_ACCOUNTS.map((acc) => (
            <Col key={acc.key} lg={6} md={12} xs={24}>
              <Card
                className="shadow-sm"
                style={{ borderTop: `3px solid ${acc.color}` }}
              >
                <div className="text-xs text-slate-500">{acc.bank}</div>
                <div className="text-lg font-bold mt-1 tabular-nums">{formatVND(acc.balance)}</div>
                <div className="text-xs text-slate-400 mt-2 font-mono">{acc.acc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  )
}
