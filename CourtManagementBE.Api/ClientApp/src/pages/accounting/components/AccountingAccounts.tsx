import { useMemo, useState } from 'react'
import { Button, Card, Descriptions, Form, Input, Modal, Select, Space, Switch, Table, Tag, message } from 'antd'
import { FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAccountingAccountsQuery, useAccountingAccountTypesQuery, useCreateAccountMutation } from '@/features/accounting/api/useAccountingQueries'
import type { ChartOfAccount, ChartOfAccountRequest } from '@/features/accounting/model/types'

const typeColorMap: Record<string, string> = {
  Asset: 'blue',
  Liability: 'gold',
  Equity: 'purple',
  Revenue: 'green',
  Expense: 'red',
  'Tài sản': 'blue',
  'Doanh thu': 'green',
  'Chi phí': 'red',
  'Nợ phải trả': 'gold',
}

interface ChartOfAccountTreeNode extends ChartOfAccount {
  children?: ChartOfAccountTreeNode[]
}

function buildAccountTree(flatAccounts: ChartOfAccount[]): ChartOfAccountTreeNode[] {
  const map: Record<string, ChartOfAccountTreeNode> = {}
  const roots: ChartOfAccountTreeNode[] = []

  // First pass: create nodes
  flatAccounts.forEach((acc) => {
    map[acc.id] = { ...acc, children: [] }
  })

  // Second pass: link children to parent
  flatAccounts.forEach((acc) => {
    const node = map[acc.id]
    if (node.parentAccountId && map[node.parentAccountId]) {
      map[node.parentAccountId].children!.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort helper
  const sortByAccountCode = (a: ChartOfAccountTreeNode, b: ChartOfAccountTreeNode) => {
    return a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true, sensitivity: 'base' })
  }

  // Sort root nodes
  roots.sort(sortByAccountCode)

  // Recursively clean empty children arrays and sort
  const processNodes = (nodes: ChartOfAccountTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children) {
        if (node.children.length === 0) {
          delete node.children
        } else {
          node.children.sort(sortByAccountCode)
          processNodes(node.children)
        }
      }
    })
  }
  processNodes(roots)

  return roots
}

function filterAccountTree(nodes: ChartOfAccountTreeNode[], query: string): ChartOfAccountTreeNode[] {
  if (!query) return nodes
  const lower = query.toLowerCase()

  return nodes
    .map((node): ChartOfAccountTreeNode | null => {
      const matchSelf =
        node.accountCode.toLowerCase().includes(lower) ||
        node.accountName.toLowerCase().includes(lower)

      let childrenMatch: ChartOfAccountTreeNode[] = []
      if (node.children) {
        childrenMatch = filterAccountTree(node.children, query)
      }

      if (matchSelf || childrenMatch.length > 0) {
        return {
          ...node,
          children: childrenMatch.length > 0 ? childrenMatch : undefined,
        }
      }
      return null
    })
    .filter((n): n is ChartOfAccountTreeNode => n !== null)
}


export function AccountingAccounts() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const parentId = Form.useWatch('parentAccountId', form)
  const isSubAccount = !!parentId

  const query = useAccountingAccountsQuery()
  const accountTypesQuery = useAccountingAccountTypesQuery()
  const createMut = useCreateAccountMutation()
  const accounts = useMemo(() => query.data ?? [], [query.data])
  const accountTypes = useMemo(() => accountTypesQuery.data ?? [], [accountTypesQuery.data])
  const accountTypeNameMap = useMemo(
    () => Object.fromEntries(accountTypes.map((type) => [type.code, type.name])),
    [accountTypes],
  )
  const accountTypeOptions = useMemo(
    () => accountTypes.map((type) => ({ label: type.name, value: type.code })),
    [accountTypes],
  )

  const selectedAccount = useMemo(() => accounts.find((a) => a.accountCode === selectedCode) ?? accounts[0] ?? null, [accounts, selectedCode])

  const flatOptions = useMemo(() => accounts.map((a) => ({ label: `${a.accountCode} — ${a.accountName}`, value: a.id })), [accounts])

  const accountTree = useMemo(() => {
    const fullTree = buildAccountTree(accounts)
    return filterAccountTree(fullTree, searchText)
  }, [accounts, searchText])

  const onCreate = async (values: ChartOfAccountRequest) => {
    await createMut.mutateAsync({
      accountCode: values.accountCode,
      accountName: values.accountName,
      accountType: values.accountType,
      parentAccountId: values.parentAccountId || null,
      level: Number(values.level),
      isActive: values.isActive !== false,
    })
    message.success('Đã thêm tài khoản mới.')
    setIsModalOpen(false)
    form.resetFields()
  }

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Hệ thống tài khoản</h2>
          <p className="text-xs text-slate-500 mb-0">Danh mục tài khoản kế toán lấy trực tiếp từ database.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              form.setFieldsValue({ isActive: true, accountType: accountTypes[0]?.code ?? 'Asset', level: 1 })
              setIsModalOpen(true)
            }}
          >
            Thêm tài khoản
          </Button>
        </Space>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="border-slate-200 shadow-sm flex-2" title="Danh sách tài khoản" extra={<Tag>{accounts.length} tài khoản</Tag>}>
          <Space className="w-full mb-4" wrap>
            <Input.Search
              placeholder="Tìm theo mã hoặc tên tài khoản…"
              style={{ width: 300 }}
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
            <Button icon={<FilterOutlined />}>Loại</Button>
          </Space>
          <Table
            key={searchText ? `search-${searchText}` : 'normal'}
            rowKey="id"
            loading={query.isLoading}
            columns={[
              {
                title: 'Mã · Tên tài khoản',
                key: 'name',
                render: (_, record: ChartOfAccount) => (
                  <Space>
                    <span className="font-mono font-bold text-xs">{record.accountCode}</span>
                    <span>{record.accountName}</span>
                  </Space>
                ),
              },
              { title: 'Cấp', dataIndex: 'level', width: 80, align: 'center', render: (lv: number) => <Tag color={lv === 1 ? 'purple' : 'default'}>Cấp {lv}</Tag> },
              { title: 'Loại', dataIndex: 'accountType', width: 130, render: (type: string) => <Tag color={typeColorMap[type] ?? 'default'}>{accountTypeNameMap[type] ?? type}</Tag> },
              { title: 'Trạng thái', dataIndex: 'isActive', width: 120, align: 'center', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Hoạt động' : 'Ngưng hoạt động'}</Tag> },
            ]}
            dataSource={accountTree}
            expandable={{
              defaultExpandAllRows: true,
            }}
            pagination={false}
            size="middle"
            onRow={(record) => ({ onClick: () => setSelectedCode(record.accountCode), style: { cursor: 'pointer', background: record.accountCode === selectedCode ? '#eff6ff' : undefined } })}
            scroll={{ x: 500 }}
          />
        </Card>

        <Card className="border-slate-200 shadow-sm flex-1" title="Chi tiết tài khoản">
          {selectedAccount ? (
            <Space className="w-full" direction="vertical" size={16}>
              <div className="text-center"><div className="font-mono text-3xl font-bold text-blue-600">{selectedAccount.accountCode}</div></div>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Tên tài khoản">{selectedAccount.accountName}</Descriptions.Item>
                <Descriptions.Item label="Cấp tài khoản"><Tag color="purple">Cấp {selectedAccount.level}</Tag></Descriptions.Item>
                <Descriptions.Item label="Loại"><Tag color={typeColorMap[selectedAccount.accountType] ?? 'default'}>{accountTypeNameMap[selectedAccount.accountType] ?? selectedAccount.accountType}</Tag></Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><Switch checked={selectedAccount.isActive} disabled size="small" /></Descriptions.Item>
              </Descriptions>
            </Space>
          ) : <div className="text-center py-8 text-slate-400">Chọn tài khoản để xem chi tiết</div>}
        </Card>
      </div>

      <Modal title="Thêm tài khoản mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, accountType: accountTypes[0]?.code ?? 'Asset', level: 1 }}
          onFinish={onCreate}
          onValuesChange={(changedValues) => {
            if (changedValues.parentAccountId !== undefined) {
              const parentId = changedValues.parentAccountId
              if (parentId) {
                const parent = accounts.find((a) => a.id === parentId)
                if (parent) {
                  form.setFieldsValue({
                    level: parent.level + 1,
                    accountType: parent.accountType,
                  })
                }
              } else {
                form.setFieldsValue({
                  level: 1,
                })
              }
            }
          }}
        >
          <Form.Item name="accountCode" label="Mã tài khoản" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="accountName" label="Tên tài khoản" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="accountType" label="Loại tài khoản" rules={[{ required: true }]}>
            <Select disabled={isSubAccount} loading={accountTypesQuery.isLoading} options={accountTypeOptions} />
          </Form.Item>
          <Form.Item name="parentAccountId" label="Tài khoản cha"><Select allowClear placeholder="Để trống nếu là tài khoản cấp 1" options={flatOptions} /></Form.Item>
          <Form.Item name="level" label="Cấp tài khoản (Tự động tính)"><Input type="number" disabled /></Form.Item>
          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item className="mb-0 flex justify-end"><Space><Button onClick={() => setIsModalOpen(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={createMut.isPending}>Thêm mới</Button></Space></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

