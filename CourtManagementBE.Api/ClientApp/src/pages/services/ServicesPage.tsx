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
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceMutation,
} from '@/features/services/api/useServiceQueries'
import { useUnitsQuery } from '@/features/units/api/useUnitQueries'
import { useServiceTypesQuery } from '@/features/service-types/api/useServiceTypeQueries'
import type { Service, CreateServiceRequest } from '@/features/services/model/types'
import { UnitConversionDrawer } from './components/UnitConversionDrawer'
import { toApiError } from '@/utils/errors'
import { formatCompactCurrency } from '@/utils/format'
import type { ServiceType } from '@/features/service-types/model/types'

export function ServicesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  // State quản lý Drawer quy đổi đơn vị
  const [conversionOpen, setConversionOpen] = useState(false)
  const [activeService, setActiveService] = useState<Service | null>(null)

  const query = useServicesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const unitsQuery = useUnitsQuery()
  const unitsList = unitsQuery.data?.items ?? []

  const serviceTypesQuery = useServiceTypesQuery()
  const serviceTypesList = serviceTypesQuery.data?.items ?? []

  const createMut = useCreateServiceMutation()
  const updateMut = useUpdateServiceMutation()
  const deleteMut = useDeleteServiceMutation()


  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      isActive: true,
      price: undefined,
      isTrackStock: false,
      stockQuantity: 0,
    })
    setOpen(true)
  }

  const openEdit = (r: Service) => {
    setEditingId(r.serviceID)
    form.setFieldsValue(r)
    setOpen(true)
  }

  const openConversion = (r: Service) => {
    setActiveService(r)
    setConversionOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()

      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: v })
        message.success('Cập nhật dịch vụ thành công')
      } else {
        await createMut.mutateAsync(v as CreateServiceRequest)
        message.success('Tạo dịch vụ thành công')
      }
      setOpen(false)
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải dịch vụ..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm DV
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'serviceID', width: 70 },
            { title: 'Mã', dataIndex: 'serviceCode', width: 100 },
            { title: 'Tên DV', dataIndex: 'serviceName' },
            {
              title: 'Loại',
              dataIndex: 'serviceType',
              width: 100,
              render: (serviceType: ServiceType) => serviceType?.name || '',
            },
            {
              title: 'Đơn vị',
              key: 'unit',
              width: 120,
              render: (_: unknown, r: Service) =>
                r.baseUnit ? `${r.baseUnit.name}` : '-',
            },
            {
              title: 'Kho hàng',
              key: 'stock',
              width: 130,
              render: (_, r: Service) => {
                if (!r.isTrackStock)
                  return <span className="text-gray-400">Không quản lý</span>
                return (
                  <span
                    className={
                      r.stockQuantity <= 5
                        ? 'text-red-500 font-bold'
                        : 'text-green-600 font-medium'
                    }
                  >
                    {r.stockQuantity} {r.baseUnit?.symbol || r.baseUnit?.name || ''}
                  </span>
                )
              },
            },
            {
              title: 'Giá',
              dataIndex: 'price',
              width: 120,
              render: (v: number) => formatCompactCurrency(v),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              width: 80,
              render: (v: boolean) => (
                <span className={v ? 'text-green-600' : 'text-red-500'}>{v ? 'Active' : 'Inactive'}</span>
              ),
            },
            {
              title: '',
              width: 130,
              render: (_: unknown, r: Service) => (
                <Space>
                  <Button
                    icon={<SwapOutlined />}
                    onClick={() => openConversion(r)}
                    size="small"
                    type="link"
                    title="Quy đổi đơn vị"
                    disabled={!r.unitID}
                  />
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(r)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoá?"
                    onConfirm={() => deleteMut.mutate(r.serviceID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          rowKey="serviceID"
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (t) => `Tổng ${t}`,
          }}
          scroll={{ x: 700 }}
          size="middle"
        />
      </Card>
      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        okText={editingId ? 'Cập nhật' : 'Tạo'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Sửa DV' : 'Thêm DV'}
        width={540}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã DV"
            name="serviceCode"
            rules={[{ required: true, message: 'Nhập mã dịch vụ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên DV"
            name="serviceName"
            rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Loại dịch vụ"
            name="serviceTypeID"
            rules={[{ required: true, message: 'Chọn loại dịch vụ!' }]}
          >
            <Select placeholder="Chọn loại dịch vụ" loading={serviceTypesQuery.isPending}>
              {serviceTypesList.map((t) => (
                <Select.Option key={t.serviceTypeID} value={t.serviceTypeID}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Đơn vị tính cơ bản"
            name="unitID"
            rules={[{ required: true, message: 'Chọn đơn vị tính cơ bản!' }]}
          >
            <Select placeholder="Chọn đơn vị tính" loading={unitsQuery.isPending}>
              {unitsList.map((u) => (
                <Select.Option key={u.unitID} value={u.unitID}>
                  {u.name} ({u.symbol})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space className="w-full font-normal" size={16}>
            <Form.Item
              label="Số lượng tối thiểu"
              name="minQuantity"
              className="mb-0 flex-1"
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Số lượng tối đa" name="maxQuantity" className="mb-0 flex-1">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Space>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Form.Item
              label="Quản lý kho hàng"
              name="isTrackStock"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {() => {
                const isTrackStock = form.getFieldValue('isTrackStock')
                if (!isTrackStock) return null
                return (
                  <Form.Item
                    label="Số lượng tồn kho"
                    name="stockQuantity"
                    rules={[{ required: true, message: 'Nhập số lượng tồn kho' }]}
                  >
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                )
              }}
            </Form.Item>
          </div>

          <Form.Item label="Giá hiện tại" name="price" className="mt-4">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <UnitConversionDrawer
        open={conversionOpen}
        onClose={() => {
          setConversionOpen(false)
          setActiveService(null)
        }}
        units={unitsList}
        service={activeService}
      />
    </Space>
  )
}
