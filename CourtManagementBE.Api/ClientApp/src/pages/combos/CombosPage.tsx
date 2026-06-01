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
  Space,
  Switch,
  Table,
  Select,
  Tag,
  Row,
  Col,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCombosQuery,
  useCreateComboMutation,
  useUpdateComboMutation,
  useDeleteComboMutation,
  useToggleComboMutation,
} from '@/features/combos/api/useComboQueries'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import type {
  Combo,
  ComboRequest,
  ComboServiceRequest,
} from '@/features/combos/model/types'
import { toApiError } from '@/utils/errors'

export function CombosPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  // Fetch combos
  const combosQuery = useCombosQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )

  // Fetch services for dropdown selection
  const servicesQuery = useServicesQuery({ page: 1, pageSize: 100 })

  const createMut = useCreateComboMutation()
  const updateMut = useUpdateComboMutation()
  const deleteMut = useDeleteComboMutation()
  const toggleMut = useToggleComboMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, services: [] })
    setOpen(true)
  }

  const openEdit = (r: Combo) => {
    setEditingId(r.comboID)
    form.setFieldsValue({
      comboCode: r.comboCode,
      comboName: r.comboName,
      description: r.description,
      comboPrice: r.comboPrice,
      durationHours: r.durationHours,
      isActive: r.isActive,
      services: r.services.map((s) => ({
        serviceID: s.serviceID,
        quantity: s.quantity,
      })),
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      const payload: ComboRequest = {
        comboCode: v.comboCode,
        comboName: v.comboName,
        description: v.description || '',
        comboPrice: v.comboPrice,
        durationHours: v.durationHours,
        isActive: v.isActive,
        services: (v.services || []).map((s: ComboServiceRequest) => ({
          serviceID: s.serviceID,
          quantity: s.quantity,
        })),
      }

      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload })
        message.success('Cập nhật combo thành công')
      } else {
        await createMut.mutateAsync(payload)
        message.success('Tạo combo thành công')
      }
      setOpen(false)
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await toggleMut.mutateAsync(id)
      message.success('Cập nhật trạng thái combo thành công')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa combo thành công')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      value,
    )
  }

  if (combosQuery.isPending) return <LoadingSpin tip="Đang tải danh sách combo..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={combosQuery.isRefetching}
            onClick={() => combosQuery.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm Combo
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm border border-gray-100">
        <Table
          columns={[
            {
              title: 'Mã Combo',
              dataIndex: 'comboCode',
              width: 130,
              render: (v: string) => <Tag color="geekblue">{v}</Tag>,
            },
            {
              title: 'Tên Gói',
              dataIndex: 'comboName',
              render: (v: string, r: Combo) => (
                <div>
                  <div className="font-semibold text-gray-800">{v}</div>
                  <div className="text-xs text-gray-400">{r.description}</div>
                </div>
              ),
            },
            {
              title: 'Giá Combo',
              dataIndex: 'comboPrice',
              width: 130,
              render: (v: number) => (
                <span className="font-bold text-emerald-600">{formatPrice(v)}</span>
              ),
            },
            {
              title: 'Thời lượng',
              dataIndex: 'durationHours',
              width: 120,
              render: (v: number) => <Tag color="orange">{v} Giờ chơi</Tag>,
            },
            {
              title: 'Dịch vụ tặng kèm',
              dataIndex: 'services',
              render: (services: Combo['services']) => (
                <div className="flex flex-wrap gap-1">
                  {services && services.length > 0 ? (
                    services.map((s) => (
                      <Tag color="purple" key={s.serviceID}>
                        {s.serviceName} x{s.quantity} {s.unit}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">Không có dịch vụ</span>
                  )}
                </div>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              width: 110,
              render: (v: boolean, r: Combo) => (
                <Switch
                  checked={v}
                  size="small"
                  loading={toggleMut.isPending}
                  onChange={() => handleToggle(r.comboID)}
                />
              ),
            },
            {
              title: 'Thao tác',
              width: 100,
              render: (_: unknown, r: Combo) => (
                <Space>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEdit(r)}
                      size="small"
                      type="link"
                    />
                  </Tooltip>
                  <Tooltip title="Xoá">
                    <Popconfirm
                      title="Bạn có chắc muốn xoá combo này?"
                      onConfirm={() => handleDelete(r.comboID)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              ),
            },
          ]}
          dataSource={combosQuery.data?.items ?? []}
          loading={combosQuery.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          rowKey="comboID"
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: combosQuery.data?.totalCount ?? 0,
            showTotal: (t) => `Tổng số ${t} gói combo`,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Cập nhật Gói Combo' : 'Tạo Gói Combo mới'}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã Combo"
                name="comboCode"
                rules={[{ required: true, message: 'Vui lòng nhập mã combo!' }]}
              >
                <Input placeholder="Ví dụ: COMBO_SANG_SOM" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên Gói Combo"
                name="comboName"
                rules={[{ required: true, message: 'Vui lòng nhập tên combo!' }]}
              >
                <Input placeholder="Ví dụ: Combo Trải Nghiệm Sáng Sớm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả gói" name="description">
            <Input.TextArea
              rows={2}
              placeholder="Nhập chi tiết mô tả quà tặng, ưu đãi..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giá Combo (VND)"
                name="comboPrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá tiền combo!' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value?: string): number =>
                    value ? parseFloat(value.replace(/\$\s?|,/g, '')) : 0
                  }
                  placeholder="Giá trọn gói"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời lượng thuê sân (Giờ)"
                name="durationHours"
                rules={[{ required: true, message: 'Vui lòng nhập số giờ chơi!' }]}
              >
                <InputNumber className="w-full" min={1} placeholder="Ví dụ: 2" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Trạng thái kích hoạt" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <h5
            className="text-base font-semibold"
            style={{ marginTop: 16, marginBottom: 12 }}
          >
            Sản phẩm & Dịch vụ đi kèm
          </h5>

          <Form.List name="services">
            {(fields, { add, remove }) => (
              <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200">
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle" style={{ marginBottom: 12 }}>
                    <Col span={14}>
                      <Form.Item
                        {...restField}
                        name={[name, 'serviceID']}
                        rules={[{ required: true, message: 'Chọn dịch vụ!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder="Chọn nước uống / dịch vụ đi kèm"
                          loading={servicesQuery.isPending}
                          showSearch
                          optionFilterProp="label"
                          options={
                            servicesQuery.data?.items
                              ?.filter((s) => s.isActive)
                              .map((s) => ({
                                value: s.serviceID,
                                label: `${s.serviceName} (${s.baseUnit?.name})`,
                              })) ?? []
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Nhập số lượng!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber className="w-full" min={1} placeholder="Số lượng" />
                      </Form.Item>
                    </Col>
                    <Col span={2} className="text-center">
                      <MinusCircleOutlined
                        className="text-red-500 hover:text-red-700 cursor-pointer text-lg"
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm quà tặng / dịch vụ đi kèm
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Space>
  )
}
