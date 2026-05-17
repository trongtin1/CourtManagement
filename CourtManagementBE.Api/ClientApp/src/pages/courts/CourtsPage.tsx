import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
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
  useCourtsQuery,
  useCreateCourtMutation,
  useDeleteCourtMutation,
  useToggleCourtMutation,
  useUpdateCourtMutation,
} from '@/features/courts/api/useCourtQueries'
import type {
  Court,
  CreateCourtRequest,
  UpdateCourtRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>()
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const courtsQuery = useCourtsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtMutation()
  const updateMut = useUpdateCourtMutation()
  const deleteMut = useDeleteCourtMutation()
  const toggleMut = useToggleCourtMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: Court) => {
    setEditingId(record.courtID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateCourtRequest = {
          courtTypeID: values.courtTypeID,
          courtCode: values.courtCode,
          courtName: values.courtName,
          statusID: values.statusID,
          length: values.length,
          width: values.width,
          capacity: values.capacity,
          sortOrder: values.sortOrder,
          description: values.description,
          imageURL: values.imageURL,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cập nhật sân thành công')
      } else {
        await createMut.mutateAsync(values as CreateCourtRequest)
        message.success('Tạo sân thành công')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  if (courtsQuery.isPending) return <LoadingSpin tip="Đang tải sân..." />

  const courts = courtsQuery.data?.items ?? []
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      !normalizedSearch ||
      court.courtCode?.toLowerCase().includes(normalizedSearch) ||
      court.courtName?.toLowerCase().includes(normalizedSearch) ||
      String(court.facilityID).includes(normalizedSearch)
    const matchesActive = activeFilter === undefined || court.isActive === activeFilter

    return matchesSearch && matchesActive
  })
  const activeCount = courts.filter((court) => court.isActive).length
  const inactiveCount = courts.length - activeCount

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Space wrap>
          <Input.Search
            allowClear
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm mã sân, tên sân, cơ sở..."
            style={{ width: 300 }}
            value={searchText}
          />
          <Select
            allowClear
            onChange={setActiveFilter}
            options={[
              { label: 'Đang hoạt động', value: true },
              { label: 'Tạm tắt', value: false },
            ]}
            placeholder="Trạng thái"
            style={{ width: 170 }}
            value={activeFilter}
          />
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={courtsQuery.isRefetching}
            onClick={() => courtsQuery.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm sân
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Sân đang hiển thị" value={filteredCourts.length} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Đang hoạt động" value={activeCount} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Tạm tắt" value={inactiveCount} />
          </Card>
        </Col>
      </Row>

      <Card className="border-slate-200 shadow-sm" title="Danh sách sân">
        <Table
          columns={[
            { title: 'ID', dataIndex: 'courtID', width: 70 },
            { title: 'Mã', dataIndex: 'courtCode', width: 100 },
            { title: 'Tên sân', dataIndex: 'courtName' },
            { title: 'Cơ sở', dataIndex: 'facilityID', width: 90 },
            {
              title: 'Kích thước',
              render: (_: unknown, record: Court) =>
                `${record.length} x ${record.width}m`,
              width: 120,
            },
            { title: 'Sức chứa', dataIndex: 'capacity', width: 90 },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              width: 140,
              render: (value: boolean, record: Court) => (
                <Space>
                  <Switch
                    checked={value}
                    loading={toggleMut.isPending}
                    size="small"
                    onChange={() => toggleMut.mutate(record.courtID)}
                  />
                  <Tag color={value ? 'green' : 'default'}>
                    {value ? 'Hoạt động' : 'Tạm tắt'}
                  </Tag>
                </Space>
              ),
            },
            {
              title: '',
              width: 100,
              render: (_: unknown, record: Court) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xóa sân?"
                    onConfirm={() => deleteMut.mutate(record.courtID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={filteredCourts}
          loading={courtsQuery.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          rowKey="courtID"
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: courtsQuery.data?.totalCount ?? 0,
            showTotal: (total) => `Tổng ${total}`,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editingId ? 'Cập nhật' : 'Tạo'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Sửa sân' : 'Thêm sân'}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {!editingId && (
              <Col md={8} xs={24}>
                <Form.Item
                  label="Cơ sở ID"
                  name="facilityID"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" min={1} />
                </Form.Item>
              </Col>
            )}
            <Col md={editingId ? 12 : 8} xs={24}>
              <Form.Item
                label="Loại sân ID"
                name="courtTypeID"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
            <Col md={editingId ? 12 : 8} xs={24}>
              <Form.Item
                label="Trạng thái ID"
                name="statusID"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={10} xs={24}>
              <Form.Item label="Mã sân" name="courtCode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={14} xs={24}>
              <Form.Item label="Tên sân" name="courtName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={8} xs={24}>
              <Form.Item label="Dài" name="length">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col md={8} xs={24}>
              <Form.Item label="Rộng" name="width">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col md={8} xs={24}>
              <Form.Item label="Sức chứa" name="capacity">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Đang hoạt động" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
