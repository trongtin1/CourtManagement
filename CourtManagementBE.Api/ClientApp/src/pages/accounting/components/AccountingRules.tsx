import { useState } from 'react'
import { Button, Card, Descriptions, Input, Select, Space, Switch, Table, Tag, message } from 'antd'
import { PlusOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAccountingRulesQuery } from '@/features/accounting/api/useAccountingQueries'
import type { AccountingRule } from '@/features/accounting/model/types'

export function AccountingRules() {
  const query = useAccountingRulesQuery()
  const rules = query.data ?? []
  const [active, setActive] = useState<AccountingRule | null>(null)
  const rule = active ?? rules[0] ?? null

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Quy tắc định khoản tự động</h2>
          <p className="text-xs text-slate-500 mb-0">Dữ liệu thật từ DB, dùng cho sinh bút toán Draft ở background.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
          <Button type="primary" icon={<PlusOutlined />}>Tạo quy tắc mới</Button>
        </Space>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        <Card className="border-slate-200 shadow-sm flex-3" title="Danh sách quy tắc" extra={<Tag>{rules.length} quy tắc</Tag>}>
          <Space className="w-full mb-4" wrap>
            <Input.Search placeholder="Tìm quy tắc…" style={{ width: 240 }} allowClear />
            <Select defaultValue="all" style={{ width: 180 }} options={[{ label: 'Mọi nghiệp vụ', value: 'all' }]} />
          </Space>
          <Table
            rowKey="id"
            loading={query.isLoading}
            columns={[
              {
                title: 'Quy tắc định khoản',
                key: 'rule',
                render: (_, record: AccountingRule) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{record.id}</span>
                      <span className="font-semibold text-sm">{record.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="blue">{record.transactionType}</Tag>
                      <span className="text-xs text-slate-500 font-medium">Nguồn: <span className="font-mono font-bold text-xs">{record.originalSource}</span></span>
                      <span className="text-xs text-slate-400">· Nợ {record.debitAccount} / Có {record.creditAccount}</span>
                    </div>
                  </div>
                ),
              },
              { title: 'Trạng thái', width: 100, align: 'center', render: () => <Switch checked size="small" /> },
            ]}
            dataSource={rules}
            pagination={false}
            size="small"
            onRow={(record) => ({ onClick: () => setActive(record), style: { cursor: 'pointer', background: record.id === rule?.id ? '#eff6ff' : undefined } })}
          />
        </Card>

        <Card className="border-slate-200 shadow-sm flex-2" title={rule ? `Chi tiết quy tắc ${rule.id}` : 'Chi tiết quy tắc'}>
          {rule ? (
            <Space className="w-full" direction="vertical" size={16}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Bảng dữ liệu nguồn"><span className="font-mono font-bold text-blue-600">{rule.originalSource}</span></Descriptions.Item>
                <Descriptions.Item label="Loại giao dịch"><Tag color="cyan">{rule.transactionType}</Tag></Descriptions.Item>
                <Descriptions.Item label="Mô tả">{rule.description}</Descriptions.Item>
              </Descriptions>

              <Card size="small" title="Điều kiện lọc">
                {rule.conditions.length > 0 ? rule.conditions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between border-b py-2 text-xs">
                    <span>{c.fieldName} {c.operator} {c.expectedValue}</span>
                    <span className="text-slate-400">{c.sourceTable}</span>
                  </div>
                )) : <div className="text-slate-400 text-xs">Không có điều kiện</div>}
              </Card>

              <Card size="small" title="Bút toán mẫu">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Nợ">{rule.debitAccount}</Descriptions.Item>
                  <Descriptions.Item label="Có">{rule.creditAccount}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Button type="primary" icon={<PlayCircleOutlined />} block onClick={() => message.info('Phần test quy tắc sẽ gắn sau khi có endpoint quản lý quy tắc.')}>Kiểm tra giả lập quy tắc</Button>
            </Space>
          ) : <div className="text-center py-8 text-slate-400">Không có quy tắc</div>}
        </Card>
      </div>
    </Space>
  )
}
