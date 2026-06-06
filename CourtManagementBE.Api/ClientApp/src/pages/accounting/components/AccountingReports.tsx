import { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Segmented,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Progress,
} from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  RiseOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons'

const formatVND = (v: number) => v.toLocaleString('vi-VN')

type ReportTab = 'revenue' | 'cashflow' | 'pl' | 'trial'

export function AccountingReports() {
  const [tab, setTab] = useState<ReportTab>('revenue')

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Báo cáo tài chính</h2>
          <p className="text-xs text-slate-500 mb-0">Bảng cân đối phát sinh, kết quả kinh doanh và báo cáo doanh thu.</p>
        </div>
        <div className="shrink-0">
          <Space>
            <Button icon={<PrinterOutlined />}>In báo cáo</Button>
            <Button icon={<DownloadOutlined />} type="primary">
              Xuất Excel
            </Button>
          </Space>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as ReportTab)}
          options={[
            {
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <BarChartOutlined /> Doanh thu
                </span>
              ),
              value: 'revenue',
            },
            {
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <LineChartOutlined /> Thu chi
                </span>
              ),
              value: 'cashflow',
            },
            {
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <RiseOutlined /> Lãi lỗ
                </span>
              ),
              value: 'pl',
            },
            {
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <BarChartOutlined /> Cân đối TK
                </span>
              ),
              value: 'trial',
            },
          ]}
        />
      </div>

      {/* Period selector */}
      <Space wrap>
        <span className="text-sm text-slate-500">Kỳ:</span>
        <DatePicker placeholder="Từ ngày" />
        <span>→</span>
        <DatePicker placeholder="Đến ngày" />
        <Select
          defaultValue="all"
          style={{ width: 180 }}
          options={[
            { label: 'Tất cả chi nhánh', value: 'all' },
            { label: 'CN Quận 7', value: 'q7' },
            { label: 'CN Quận 1', value: 'q1' },
          ]}
        />
        <Tag color="blue">Tháng 5/2026</Tag>
      </Space>

      {tab === 'revenue' && <RevenueReport />}
      {tab === 'cashflow' && <CashflowReport />}
      {tab === 'pl' && <ProfitLoss />}
      {tab === 'trial' && <TrialBalance />}
    </Space>
  )
}

function RevenueReport() {
  return (
    <Space className="w-full" direction="vertical" size={24}>
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Tổng doanh thu kỳ"
              value="486.2M₫"
              valueStyle={{ color: '#3b82f6' }}
              suffix={<Tag color="green">+18.4%</Tag>}
            />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Doanh thu sân" value="412.6M₫" suffix={<Tag>84.9%</Tag>} />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Doanh thu canteen" value="58.4M₫" suffix={<Tag>12%</Tag>} />
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Khác" value="15.2M₫" suffix={<Tag>3.1%</Tag>} />
          </Card>
        </Col>
      </Row>

      {/* Doanh thu theo ngày Chart Card */}
      <Card
        className="border-slate-200 shadow-sm"
        title="Doanh thu theo ngày"
        extra={<Tag color="blue">Tháng 5/2026</Tag>}
      >
        <div className="h-64 flex items-end gap-1.5 pt-6 px-2">
          {(() => {
            const days = Array.from(
              { length: 30 },
              (_, i) => 8 + Math.sin(i / 2) * 4 + i * 0.3,
            )
            const max = Math.max(...days)
            return days.map((v, i) => (
              <div
                key={i}
                className="flex-1 group relative h-full flex flex-col justify-end"
              >
                {/* Tooltip */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none shadow">
                  {Math.round(v * 1000000).toLocaleString('vi-VN')}₫
                </div>
                <div
                  className="w-full rounded-t bg-linear-to-t from-blue-600 to-blue-400 transition-all group-hover:from-blue-500 group-hover:to-blue-300"
                  style={{ height: `${(v / max) * 100}%` }}
                />
              </div>
            ))
          })()}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
          {[1, 5, 10, 15, 20, 25, 30].map((d) => (
            <span key={d}>{d}/5</span>
          ))}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col md={12} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Theo loại sân"
            extra={<Tag>Top 5</Tag>}
          >
            <Space className="w-full" direction="vertical" size={12}>
              {[
                { l: 'Cầu lông', v: 156, p: 38 },
                { l: 'Pickleball', v: 107, p: 26 },
                { l: 'Tennis', v: 74, p: 18 },
                { l: 'Bóng đá', v: 49, p: 12 },
                { l: 'Bóng rổ', v: 25, p: 6 },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.l}</span>
                    <span className="tabular-nums text-slate-500">
                      {r.v}M₫ · {r.p}%
                    </span>
                  </div>
                  <Progress
                    percent={r.p * 2.5}
                    showInfo={false}
                    strokeColor="#3b82f6"
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Theo chi nhánh"
            extra={<Tag>So sánh</Tag>}
          >
            <Space className="w-full" direction="vertical" size={12}>
              {[
                { l: 'CN Quận 7', v: 248, p: 51 },
                { l: 'CN Quận 1', v: 142, p: 29 },
                { l: 'CN Thủ Đức', v: 96, p: 20 },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.l}</span>
                    <span className="tabular-nums text-slate-500">
                      {r.v}M₫ · {r.p}%
                    </span>
                  </div>
                  <Progress
                    percent={r.p * 1.5}
                    showInfo={false}
                    strokeColor="#22c55e"
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

function CashflowReport() {
  return (
    <Space className="w-full" direction="vertical" size={24}>
      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            style={{ borderTop: '3px solid #22c55e' }}
          >
            <Statistic
              title="TỔNG THU"
              value="486.2M₫"
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            style={{ borderTop: '3px solid #ef4444' }}
          >
            <Statistic
              title="TỔNG CHI"
              value="142.8M₫"
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            style={{ borderTop: '3px solid #3b82f6' }}
          >
            <Statistic
              title="CHÊNH LỆCH"
              value="+343.4M₫"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col md={12} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Khoản thu"
            extra={<Tag>Chi tiết</Tag>}
          >
            <Table
              columns={[
                { title: 'Khoản mục', dataIndex: 'name' },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  align: 'right' as const,
                  render: (v: number) => (
                    <span className="text-emerald-600 font-semibold tabular-nums">
                      +{formatVND(v)}₫
                    </span>
                  ),
                },
              ]}
              dataSource={[
                { key: '1', name: 'Thu cho thuê sân', amount: 412600000 },
                { key: '2', name: 'Thu bán hàng canteen', amount: 58400000 },
                { key: '3', name: 'Thu cho thuê thiết bị', amount: 9200000 },
                { key: '4', name: 'Thu khác', amount: 6000000 },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card
            className="border-slate-200 shadow-sm"
            title="Khoản chi"
            extra={<Tag>Chi tiết</Tag>}
          >
            <Table
              columns={[
                { title: 'Khoản mục', dataIndex: 'name' },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  align: 'right' as const,
                  render: (v: number) => (
                    <span className="text-red-500 font-semibold tabular-nums">
                      -{formatVND(v)}₫
                    </span>
                  ),
                },
              ]}
              dataSource={[
                { key: '1', name: 'Lương nhân viên', amount: 62400000 },
                { key: '2', name: 'Mua hàng hoá', amount: 28600000 },
                { key: '3', name: 'Điện nước', amount: 18200000 },
                { key: '4', name: 'Bảo trì sân', amount: 14400000 },
                { key: '5', name: 'Marketing', amount: 8200000 },
                { key: '6', name: 'Khác', amount: 11000000 },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

function ProfitLoss() {
  const rows = [
    { key: '1', name: 'Doanh thu thuần', value: 486200000, bold: true },
    { key: '2', name: '  Doanh thu cho thuê sân', value: 412600000, indent: true },
    { key: '3', name: '  Doanh thu hàng hoá', value: 58400000, indent: true },
    { key: '4', name: '  Doanh thu khác', value: 15200000, indent: true },
    { key: '5', name: 'Giá vốn hàng bán', value: -42800000 },
    { key: '6', name: 'LỢI NHUẬN GỘP', value: 443400000, bold: true, highlight: 'blue' },
    { key: '7', name: 'Chi phí bán hàng', value: -18400000 },
    { key: '8', name: 'Chi phí quản lý', value: -81600000 },
    { key: '9', name: '  Lương nhân viên', value: -62400000, indent: true },
    { key: '10', name: '  Điện nước', value: -18200000, indent: true },
    { key: '11', name: '  Khác', value: -1000000, indent: true },
    {
      key: '12',
      name: 'LỢI NHUẬN THUẦN',
      value: 343400000,
      bold: true,
      highlight: 'green',
    },
  ]

  return (
    <Card
      className="border-slate-200 shadow-sm"
      title="Báo cáo Lãi/Lỗ"
      extra={<Tag>Kỳ hiện tại vs Kỳ trước</Tag>}
    >
      <Table
        columns={[
          {
            title: 'Chỉ tiêu',
            dataIndex: 'name',
            render: (text: string, record: (typeof rows)[number]) => (
              <span
                className={`${record.bold ? 'font-bold' : ''} ${record.indent ? 'pl-6 text-slate-500 text-xs' : ''} ${record.highlight === 'blue' ? 'text-blue-600' : ''} ${record.highlight === 'green' ? 'text-emerald-600' : ''}`}
              >
                {text}
              </span>
            ),
          },
          {
            title: 'Kỳ này (5/2026)',
            dataIndex: 'value',
            align: 'right' as const,
            render: (v: number) => <span className="tabular-nums">{formatVND(v)}</span>,
          },
          {
            title: 'Kỳ trước (4/2026)',
            key: 'prev',
            align: 'right' as const,
            render: (_: unknown, record: (typeof rows)[number]) => {
              const prev = Math.round(record.value * 0.86)
              return (
                <span className="tabular-nums text-slate-400">{formatVND(prev)}</span>
              )
            },
          },
          {
            title: 'Tăng trưởng',
            key: 'growth',
            width: 100,
            align: 'right' as const,
            render: (_: unknown, record: (typeof rows)[number]) => {
              const prev = Math.round(record.value * 0.86)
              const growth = Math.round(
                ((record.value - prev) / Math.abs(prev || 1)) * 100,
              )
              return (
                <Tag color={growth >= 0 ? 'green' : 'red'}>
                  {growth >= 0 ? '+' : ''}
                  {growth}%
                </Tag>
              )
            },
          },
        ]}
        dataSource={rows}
        pagination={false}
        size="middle"
        rowClassName={(record) => (record.bold ? 'bg-blue-50 font-bold' : '')}
        scroll={{ x: 700 }}
      />
    </Card>
  )
}

function TrialBalance() {
  const TB = [
    {
      key: '111',
      code: '111',
      name: 'Tiền mặt',
      openD: 8000000,
      openC: 0,
      debit: 124000000,
      credit: 105600000,
      children: [
        {
          key: '1111',
          code: '1111',
          name: 'Tiền Việt Nam',
          openD: 8000000,
          openC: 0,
          debit: 124000000,
          credit: 105600000,
        },
      ],
    },
    {
      key: '112',
      code: '112',
      name: 'Tiền gửi ngân hàng',
      openD: 318000000,
      openC: 0,
      debit: 286000000,
      credit: 191200000,
      children: [
        {
          key: '1121',
          code: '1121',
          name: 'Vietcombank',
          openD: 142000000,
          openC: 0,
          debit: 168000000,
          credit: 125800000,
        },
        {
          key: '1122',
          code: '1122',
          name: 'BIDV',
          openD: 86000000,
          openC: 0,
          debit: 64000000,
          credit: 53600000,
        },
      ],
    },
    {
      key: '131',
      code: '131',
      name: 'Phải thu khách hàng',
      openD: 64000000,
      openC: 0,
      debit: 32000000,
      credit: 13600000,
    },
    {
      key: '156',
      code: '156',
      name: 'Hàng hoá',
      openD: 24000000,
      openC: 0,
      debit: 28600000,
      credit: 22400000,
    },
    {
      key: '331',
      code: '331',
      name: 'Phải trả NCC',
      openD: 0,
      openC: 36000000,
      debit: 86400000,
      credit: 98600000,
    },
    {
      key: '511',
      code: '511',
      name: 'Doanh thu',
      openD: 0,
      openC: 0,
      debit: 0,
      credit: 412600000,
    },
    {
      key: '642',
      code: '642',
      name: 'Chi phí quản lý',
      openD: 0,
      openC: 0,
      debit: 81600000,
      credit: 0,
    },
  ]

  const mapRow = (r: any): any => {
    const closeD = Math.max(0, r.openD - r.openC + r.debit - r.credit)
    const closeC = Math.max(0, r.openC - r.openD + r.credit - r.debit)
    const children = r.children ? r.children.map(mapRow) : undefined
    return {
      ...r,
      closeD,
      closeC,
      children,
    }
  }

  const TB_DATA = TB.map(mapRow)

  const sum = TB_DATA.reduce(
    (a, r) => ({
      od: a.od + r.openD,
      oc: a.oc + r.openC,
      d: a.d + r.debit,
      c: a.c + r.credit,
      cd: a.cd + r.closeD,
      cc: a.cc + r.closeC,
    }),
    { od: 0, oc: 0, d: 0, c: 0, cd: 0, cc: 0 },
  )

  return (
    <Card
      className="border-slate-200 shadow-sm"
      title="Bảng cân đối tài khoản"
      extra={<Tag>Kỳ: Tháng 5/2026</Tag>}
    >
      <Table
        columns={[
          {
            title: 'Mã TK',
            dataIndex: 'code',
            width: 150,
            render: (text: string) => <span className="font-mono font-bold">{text}</span>,
          },
          { title: 'Tên tài khoản', dataIndex: 'name' },
          {
            title: 'Dư đầu kỳ - Nợ',
            dataIndex: 'openD',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? <span className="tabular-nums">{formatVND(v)}</span> : '—',
          },
          {
            title: 'Dư đầu kỳ - Có',
            dataIndex: 'openC',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? <span className="tabular-nums">{formatVND(v)}</span> : '—',
          },
          {
            title: 'Phát sinh - Nợ',
            dataIndex: 'debit',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? (
                <span className="tabular-nums text-emerald-600">{formatVND(v)}</span>
              ) : (
                '—'
              ),
          },
          {
            title: 'Phát sinh - Có',
            dataIndex: 'credit',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? <span className="tabular-nums text-red-500">{formatVND(v)}</span> : '—',
          },
          {
            title: 'Dư cuối kỳ - Nợ',
            dataIndex: 'closeD',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? <span className="tabular-nums">{formatVND(v)}</span> : '—',
          },
          {
            title: 'Dư cuối kỳ - Có',
            dataIndex: 'closeC',
            width: 130,
            align: 'right' as const,
            render: (v: number) =>
              v ? <span className="tabular-nums">{formatVND(v)}</span> : '—',
          },
        ]}
        dataSource={TB_DATA}
        pagination={false}
        size="middle"
        summary={() => (
          <Table.Summary.Row className="font-bold bg-blue-50">
            <Table.Summary.Cell index={0} colSpan={2}>
              TỔNG CỘNG
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <span className="tabular-nums">{formatVND(sum.od)}</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              <span className="tabular-nums">{formatVND(sum.oc)}</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <span className="tabular-nums">{formatVND(sum.d)}</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right">
              <span className="tabular-nums">{formatVND(sum.c)}</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right">
              <span className="tabular-nums">{formatVND(sum.cd)}</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="right">
              <span className="tabular-nums">{formatVND(sum.cc)}</span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
        scroll={{ x: 1100 }}
      />
    </Card>
  )
}
