import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCourtAssetsByCourtQuery,
  useCourtAssetsQuery,
  useCreateCourtAssetMutation,
  useDeleteCourtAssetMutation,
  useUpdateCourtAssetMutation,
} from '@/features/courts/api/useCourtAssetQueries'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import type {
  CourtAsset,
  CreateCourtAssetRequest,
  UpdateCourtAssetRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

const cleanOptional = (value: unknown) =>
  value === '' || value === undefined ? null : value

export function CourtAssetsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CourtAsset | null>(null)
  const [courtFilter, setCourtFilter] = useState<number | undefined>()
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const courtsQuery = useCourtsQuery()
  const assetsQuery = useCourtAssetsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const courtAssetsQuery = useCourtAssetsByCourtQuery(courtFilter ?? 0, !!courtFilter)
  const createMut = useCreateCourtAssetMutation()
  const updateMut = useUpdateCourtAssetMutation()
  const deleteMut = useDeleteCourtAssetMutation()

  const courts = courtsQuery.data?.items ?? []
  const dataSource = courtFilter
    ? (courtAssetsQuery.data ?? [])
    : (assetsQuery.data?.items ?? [])
  const loading = courtFilter ? courtAssetsQuery.isFetching : assetsQuery.isFetching

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      courtID: courtFilter,
      condition: 'Good',
      quantity: 1,
      isActive: true,
    })
    setOpen(true)
  }

  const openEdit = (record: CourtAsset) => {
    setEditing(record)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const toCreateRequest = (values: Record<string, unknown>): CreateCourtAssetRequest => ({
    courtID: Number(values.courtID),
    assetCode: String(values.assetCode ?? ''),
    assetName: String(values.assetName ?? ''),
    category: String(values.category ?? ''),
    quantity: Number(values.quantity ?? 0),
    unit: String(values.unit ?? ''),
    condition: String(values.condition ?? ''),
    purchaseDate: cleanOptional(values.purchaseDate) as string | null,
    purchasePrice: cleanOptional(values.purchasePrice) as number | null,
    lastMaintenanceDate: cleanOptional(values.lastMaintenanceDate) as string | null,
    nextMaintenanceDate: cleanOptional(values.nextMaintenanceDate) as string | null,
    note: String(values.note ?? ''),
    isActive: Boolean(values.isActive),
  })

  const toUpdateRequest = (values: Record<string, unknown>): UpdateCourtAssetRequest => {
    const { ...data } = toCreateRequest(values)
    return data
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.courtAssetID,
          data: toUpdateRequest(values),
        })
        message.success('Cap nhat tai san thanh cong')
      } else {
        await createMut.mutateAsync(toCreateRequest(values))
        message.success('Tao tai san thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xoa tai san thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (courtsQuery.isPending) return <LoadingSpin tip="Dang tai danh sach san..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={assetsQuery.isRefetching || courtAssetsQuery.isRefetching}
            onClick={() => {
              assetsQuery.refetch()
              if (courtFilter) courtAssetsQuery.refetch()
            }}
          >
            Lam moi
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Them tai san
          </Button>
        </Space>
      </div>

      <Card>
        <Space className="w-full" direction="vertical" size={16}>
          <Select
            allowClear
            className="w-full max-w-md"
            onChange={(value) => setCourtFilter(value)}
            options={courts.map((court) => ({
              label: `${court.courtCode} - ${court.courtName}`,
              value: court.courtID,
            }))}
            placeholder="Loc theo san"
            showSearch
            optionFilterProp="label"
            value={courtFilter}
          />

          <Table
            columns={[
              { title: 'ID', dataIndex: 'courtAssetID', width: 80 },
              {
                title: 'San',
                dataIndex: 'courtID',
                width: 170,
                render: (value: number) => {
                  const court = courts.find((item) => item.courtID === value)
                  return court ? `${court.courtCode} - ${court.courtName}` : value
                },
              },
              {
                title: 'Ma',
                dataIndex: 'assetCode',
                width: 150,
                render: (value: string) => <Tag color="blue">{value}</Tag>,
              },
              { title: 'Tai san', dataIndex: 'assetName', width: 220 },
              {
                title: 'Loai',
                dataIndex: 'category',
                width: 130,
                render: (value: string) => <Tag>{value || 'Other'}</Tag>,
              },
              {
                title: 'SL',
                width: 90,
                render: (_: unknown, record: CourtAsset) =>
                  `${record.quantity} ${record.unit}`,
              },
              {
                title: 'Tinh trang',
                dataIndex: 'condition',
                width: 130,
                render: (value: string) => (
                  <Tag
                    color={
                      value === 'Good'
                        ? 'green'
                        : value === 'Repairing'
                          ? 'orange'
                          : 'red'
                    }
                  >
                    {value}
                  </Tag>
                ),
              },
              { title: 'Bao tri tiep', dataIndex: 'nextMaintenanceDate', width: 150 },
              {
                title: 'Active',
                dataIndex: 'isActive',
                width: 90,
                render: (value: boolean) => (
                  <Switch checked={value} disabled size="small" />
                ),
              },
              {
                title: '',
                width: 110,
                render: (_: unknown, record: CourtAsset) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEdit(record)}
                      size="small"
                      type="link"
                    />
                    <Popconfirm
                      title="Xoa tai san nay?"
                      onConfirm={() => handleDelete(record.courtAssetID)}
                    >
                      <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={dataSource}
            loading={loading}
            onChange={(pagination) => setTablePagination(pagination)}
            pagination={
              courtFilter
                ? false
                : {
                    current: tablePagination.current ?? 1,
                    pageSize: tablePagination.pageSize ?? 10,
                    total: assetsQuery.data?.totalCount ?? 0,
                    showTotal: (total) => `Tong ${total}`,
                  }
            }
            rowKey="courtAssetID"
            scroll={{ x: 1160 }}
            size="middle"
          />
        </Space>
      </Card>

      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editing ? 'Cap nhat' : 'Tao'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editing ? 'Sua tai san' : 'Them tai san'}
        width={760}
      >
        <Form form={form} layout="vertical">
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              label="San"
              name="courtID"
              rules={[{ required: true, message: 'Chon san' }]}
            >
              <Select
                disabled={!!editing}
                options={courts.map((court) => ({
                  label: `${court.courtCode} - ${court.courtName}`,
                  value: court.courtID,
                }))}
                placeholder="Chon san"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              label="Ma tai san"
              name="assetCode"
              rules={[{ required: true, message: 'Nhap ma tai san' }]}
            >
              <Input maxLength={30} placeholder="A01-NET" />
            </Form.Item>
            <Form.Item
              label="Ten tai san"
              name="assetName"
              rules={[{ required: true, message: 'Nhap ten tai san' }]}
            >
              <Input maxLength={200} placeholder="Net" />
            </Form.Item>
            <Form.Item label="Loai" name="category">
              <Select
                options={[
                  { label: 'Equipment', value: 'Equipment' },
                  { label: 'Lighting', value: 'Lighting' },
                  { label: 'Furniture', value: 'Furniture' },
                  { label: 'Electronics', value: 'Electronics' },
                  { label: 'Other', value: 'Other' },
                ]}
                placeholder="Equipment"
              />
            </Form.Item>
            <Form.Item label="So luong" name="quantity">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Don vi" name="unit">
              <Input maxLength={50} placeholder="piece" />
            </Form.Item>
            <Form.Item label="Tinh trang" name="condition">
              <Select
                options={[
                  { label: 'Good', value: 'Good' },
                  { label: 'Damaged', value: 'Damaged' },
                  { label: 'Repairing', value: 'Repairing' },
                  { label: 'Lost', value: 'Lost' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Gia mua" name="purchasePrice">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Ngay mua" name="purchaseDate">
              <Input placeholder="2026-05-15" />
            </Form.Item>
            <Form.Item label="Bao tri gan nhat" name="lastMaintenanceDate">
              <Input placeholder="2026-05-15" />
            </Form.Item>
            <Form.Item label="Bao tri tiep theo" name="nextMaintenanceDate">
              <Input placeholder="2026-06-15" />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item label="Ghi chu" name="note">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
