import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useUnitsQuery } from '@/features/units/api/useUnitQueries'
import {
  useCreateUnitConversionMutation,
  useDeleteUnitConversionMutation,
  useUnitConversionsQuery,
} from '@/features/services/api/useUnitConversionQueries'
import type { Service } from '@/features/services/model/types'
import { toApiError } from '@/utils/errors'

const { Text } = Typography

interface UnitConversionDrawerProps {
  open: boolean
  onClose: () => void
  service: Service | null
}

export function UnitConversionDrawer({
  open,
  onClose,
  service,
}: UnitConversionDrawerProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const serviceId = service?.serviceID ?? 0
  const baseUnitId = service?.unitID ?? 0

  const { data: conversions, isPending: loadingConversions } =
    useUnitConversionsQuery(serviceId)
  const { data: unitsData, isPending: loadingUnits } = useUnitsQuery({
    page: 1,
    pageSize: 100,
  })
  const createMut = useCreateUnitConversionMutation()
  const deleteMut = useDeleteUnitConversionMutation(serviceId)

  const units = unitsData?.items ?? []
  const baseUnit = units.find((u) => u.unitID === baseUnitId)

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      await createMut.mutateAsync({
        serviceID: serviceId,
        sourceUnitID: v.sourceUnitID,
        targetUnitID: v.targetUnitID,
        factor: v.factor,
        isActive: true,
      })
      message.success('Thêm quy tắc quy đổi thành công')
      form.resetFields()
      form.setFieldsValue({ targetUnitID: baseUnitId })
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa quy tắc quy đổi thành công')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 16 }}>
            Quy đổi đơn vị
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Dịch vụ: {service?.serviceName} (Mã: {service?.serviceCode})
          </Text>
        </Space>
      }
      width={640}
      destroyOnClose
    >
      <Space className="w-full" direction="vertical" size={24}>
        {/* Form thêm quy tắc mới */}
        <Card size="small" title="Thêm quy tắc quy đổi mới">
          <Form
            form={form}
            initialValues={{ targetUnitID: baseUnitId }}
            layout="vertical"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Form.Item
                label="Đơn vị lớn"
                name="sourceUnitID"
                rules={[{ required: true, message: 'Chọn đơn vị nguồn' }]}
              >
                <Select placeholder="Chọn đơn vị" loading={loadingUnits}>
                  {units
                    .filter((u) => u.unitID !== baseUnitId)
                    .map((u) => (
                      <Select.Option key={u.unitID} value={u.unitID}>
                        {u.name} ({u.symbol})
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Đơn vị nhỏ (Cơ bản)"
                name="targetUnitID"
                rules={[{ required: true, message: 'Chọn đơn vị cơ bản' }]}
              >
                <Select placeholder="Chọn đơn vị" disabled loading={loadingUnits}>
                  {units.map((u) => (
                    <Select.Option key={u.unitID} value={u.unitID}>
                      {u.name} ({u.symbol})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Tỉ lệ (1 Lớn = X Nhỏ)"
                name="factor"
                rules={[{ required: true, message: 'Nhập tỉ lệ quy đổi' }]}
              >
                <InputNumber className="w-full" min={0.0001} placeholder="Ví dụ: 24" />
              </Form.Item>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div style={{ minHeight: 24 }}>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const sourceUnitID = form.getFieldValue('sourceUnitID')
                    const factor = form.getFieldValue('factor')
                    const selectedUnit = units.find((u) => u.unitID === sourceUnitID)
                    if (sourceUnitID && factor && baseUnit && selectedUnit) {
                      return (
                        <Text type="success" style={{ fontSize: 13 }}>
                          Công thức: 1 {selectedUnit.name} ({selectedUnit.symbol}) ={' '}
                          {factor} {baseUnit.name} ({baseUnit.symbol})
                        </Text>
                      )
                    }
                    return null
                  }}
                </Form.Item>
              </div>
              <Button
                icon={<PlusOutlined />}
                loading={createMut.isPending}
                onClick={handleSubmit}
                type="primary"
              >
                Thêm quy tắc
              </Button>
            </div>
          </Form>
        </Card>

        {/* Bảng quy tắc hiện tại */}
        <Table
          columns={[
            {
              title: 'Đơn vị lớn',
              dataIndex: 'sourceUnitName',
              render: (v: string, r) => `${v} (${r.sourceUnitSymbol})`,
            },
            {
              title: 'Tỉ lệ',
              dataIndex: 'factor',
              width: 100,
              render: (v: number) => `x${v}`,
            },
            {
              title: 'Đơn vị nhỏ',
              dataIndex: 'targetUnitName',
              render: (v: string, r) => `${v} (${r.targetUnitSymbol})`,
            },
            {
              title: 'Giải nghĩa',
              key: 'formula',
              render: (_, r) => (
                <Text type="secondary">
                  1 {r.sourceUnitSymbol} = {r.factor} {r.targetUnitSymbol}
                </Text>
              ),
            },
            {
              title: '',
              width: 70,
              render: (_, r) => (
                <Popconfirm
                  title="Bạn chắc chắn muốn xóa quy tắc quy đổi này?"
                  onConfirm={() => handleDelete(r.unitConversionID)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteMut.isPending}
                    size="small"
                    type="link"
                  />
                </Popconfirm>
              ),
            },
          ]}
          dataSource={conversions ?? []}
          loading={loadingConversions}
          pagination={false}
          rowKey="unitConversionID"
          size="middle"
        />
      </Space>
    </Drawer>
  )
}
