import { useState } from 'react'
import {
  App,
  Alert,
  Button,
  Card,
  Empty,
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
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ToolOutlined,
} from '@ant-design/icons'

import {
  useCourtAssetsByCourtQuery,
  useCreateCourtAssetMutation,
  useDeleteCourtAssetMutation,
  useUpdateCourtAssetMutation,
} from '@/features/courts/api/useCourtAssetQueries'
import type {
  CourtAsset,
  CreateCourtAssetRequest,
  UpdateCourtAssetRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

type CourtAssetsSectionProps = {
  courtId: number
}

const cleanOptional = (value: unknown) =>
  value === '' || value === undefined ? null : value

const toCreateRequest = (
  courtId: number,
  values: Record<string, unknown>,
): CreateCourtAssetRequest => ({
  courtID: courtId,
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

const toUpdateRequest = (
  courtId: number,
  values: Record<string, unknown>,
): UpdateCourtAssetRequest => {
  const {  ...data } = toCreateRequest(courtId, values)
  return data
}

export function CourtAssetsSection({ courtId }: CourtAssetsSectionProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CourtAsset | null>(null)

  const assetsQuery = useCourtAssetsByCourtQuery(courtId, courtId > 0)
  const createMut = useCreateCourtAssetMutation()
  const updateMut = useUpdateCourtAssetMutation()
  const deleteMut = useDeleteCourtAssetMutation()
  const assets = assetsQuery.data ?? []

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      category: 'Equipment',
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editing) {
        await updateMut.mutateAsync({
          id: editing.courtAssetID,
          data: toUpdateRequest(courtId, values),
        })
        message.success('Cập nhật tài sản thành công')
      } else {
        await createMut.mutateAsync(toCreateRequest(courtId, values))
        message.success('Thêm tài sản thành công')
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
      message.success('Xóa tài sản thành công')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  return (
    <Card
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={assetsQuery.isRefetching}
            onClick={() => assetsQuery.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm tài sản
          </Button>
        </Space>
      }
      title={
        <>
          <ToolOutlined /> Tài sản sân
        </>
      }
      style={{ borderRadius: 8 }}
    >
      {!courtId && (
        <Alert
          message="Không xác định được sân"
          description="Mở trang cấu hình từ một sân cụ thể để quản lý tài sản."
          showIcon
          type="warning"
        />
      )}

      {courtId > 0 && (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
            Quản lý thiết bị, nội thất, đèn và lịch bảo trì của sân này.
          </Typography.Paragraph>

          <Table
            columns={[
              {
                title: 'Mã',
                dataIndex: 'assetCode',
                width: 130,
                render: (value: string) => <Tag color="blue">{value}</Tag>,
              },
              { title: 'Tài sản', dataIndex: 'assetName', width: 210 },
              {
                title: 'Loại',
                dataIndex: 'category',
                width: 130,
                render: (value: string) => <Tag>{value || 'Other'}</Tag>,
              },
              {
                title: 'SL',
                width: 90,
                render: (_: unknown, record: CourtAsset) =>
                  `${record.quantity} ${record.unit || ''}`.trim(),
              },
              {
                title: 'Tình trạng',
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
                    {value || 'Unknown'}
                  </Tag>
                ),
              },
              { title: 'Bảo trì tiếp', dataIndex: 'nextMaintenanceDate', width: 150 },
              {
                title: 'Active',
                dataIndex: 'isActive',
                width: 90,
                render: (value: boolean) => <Switch checked={value} disabled size="small" />,
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
                      title="Xóa tài sản này?"
                      onConfirm={() => handleDelete(record.courtAssetID)}
                    >
                      <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={assets}
            loading={assetsQuery.isFetching}
            locale={{ emptyText: <Empty description="Sân này chưa có tài sản" /> }}
            pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total}` }}
            rowKey="courtAssetID"
            scroll={{ x: 1040 }}
            size="middle"
          />
        </Space>
      )}

      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editing ? 'Cập nhật' : 'Thêm'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editing ? 'Sửa tài sản sân' : 'Thêm tài sản sân'}
        width={760}
      >
        <Form form={form} layout="vertical">
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              label="Mã tài sản"
              name="assetCode"
              rules={[{ required: true, message: 'Nhập mã tài sản' }]}
            >
              <Input maxLength={30} placeholder="A01-NET" />
            </Form.Item>
            <Form.Item
              label="Tên tài sản"
              name="assetName"
              rules={[{ required: true, message: 'Nhập tên tài sản' }]}
            >
              <Input maxLength={200} placeholder="Lưới sân" />
            </Form.Item>
            <Form.Item label="Loại" name="category">
              <Select
                options={[
                  { label: 'Equipment', value: 'Equipment' },
                  { label: 'Lighting', value: 'Lighting' },
                  { label: 'Furniture', value: 'Furniture' },
                  { label: 'Electronics', value: 'Electronics' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Tình trạng" name="condition">
              <Select
                options={[
                  { label: 'Good', value: 'Good' },
                  { label: 'Damaged', value: 'Damaged' },
                  { label: 'Repairing', value: 'Repairing' },
                  { label: 'Lost', value: 'Lost' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Số lượng" name="quantity">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Đơn vị" name="unit">
              <Input maxLength={50} placeholder="cái" />
            </Form.Item>
            <Form.Item label="Giá mua" name="purchasePrice">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Ngày mua" name="purchaseDate">
              <Input placeholder="2026-05-15" />
            </Form.Item>
            <Form.Item label="Bảo trì gần nhất" name="lastMaintenanceDate">
              <Input placeholder="2026-05-15" />
            </Form.Item>
            <Form.Item label="Bảo trì tiếp theo" name="nextMaintenanceDate">
              <Input placeholder="2026-06-15" />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}