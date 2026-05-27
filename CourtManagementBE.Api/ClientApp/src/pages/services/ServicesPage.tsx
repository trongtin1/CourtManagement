import { useState } from 'react'
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { serviceApi } from '@/features/services/api/serviceApi'
import { servicePriceApi } from '@/features/services/api/servicePriceApi'
import { useServicesQuery, useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation, useToggleServiceMutation } from '@/features/services/api/useServiceQueries'
import type { Service, CreateServiceRequest, UpdateServiceRequest, ServicePrice } from '@/features/services/model/types'
import { toApiError } from '@/utils/errors'
import { formatCompactCurrency } from '@/utils/format'

export function ServicesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentPrice, setCurrentPrice] = useState<ServicePrice | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useServicesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateServiceMutation()
  const updateMut = useUpdateServiceMutation()
  const deleteMut = useDeleteServiceMutation()
  const toggleMut = useToggleServiceMutation()

  const openCreate = () => {
    setEditingId(null)
    setCurrentPrice(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, price: undefined })
    setOpen(true)
  }

  const openEdit = async (r: Service) => {
    setEditingId(r.serviceID)
    setOpen(true)
    try {
      const detail = await serviceApi.getById(r.serviceID)
      const latest = [...(detail.servicePrices ?? [])]
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0]

      setCurrentPrice(latest ?? null)
      form.setFieldsValue({
        ...detail,
        price: latest?.price,
      })
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      const priceValue = v.price as number | undefined
      const nowIso = new Date().toISOString()

      if (editingId) {
        const data: UpdateServiceRequest = {
          serviceCode: v.serviceCode,
          serviceName: v.serviceName,
          serviceType: v.serviceType,
          unit: v.unit,
          minQuantity: v.minQuantity,
          maxQuantity: v.maxQuantity,
          isActive: v.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        if (priceValue != null) {
          if (currentPrice) {
            await servicePriceApi.update(currentPrice.id, {
              serviceID: currentPrice.serviceID,
              price: priceValue,
              effectiveDate: currentPrice.effectiveDate,
              expiryDate: currentPrice.expiryDate ?? null,
            })
          } else {
            await servicePriceApi.create({
              serviceID: editingId,
              price: priceValue,
              effectiveDate: nowIso,
              expiryDate: null,
            })
          }
        }
        message.success('Cập nhật dịch vụ thành công')
      } else {
        const created = await createMut.mutateAsync(v as CreateServiceRequest)
        if (priceValue != null) {
          await servicePriceApi.create({
            serviceID: created.serviceID,
            price: priceValue,
            effectiveDate: nowIso,
            expiryDate: null,
          })
        }
        message.success('Tạo dịch vụ thành công')
      }
      setOpen(false)
    } catch (e) { if (e && typeof e === 'object' && 'errorFields' in e) return; message.error(toApiError(e).message) }
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải dịch vụ..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Dịch vụ</Typography.Title>
          <Typography.Paragraph type="secondary">Dịch vụ bổ sung (nước uống, vợt, ...)</Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Làm mới</Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Thêm DV</Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'serviceID', width: 70 },
            { title: 'Mã', dataIndex: 'serviceCode', width: 100 },
            { title: 'Tên DV', dataIndex: 'serviceName' },
            { title: 'Loại', dataIndex: 'serviceType', width: 100 },
            { title: 'Đơn vị', dataIndex: 'unit', width: 80 },
            { title: 'Giá', dataIndex: 'servicePrices', width: 120, render: (v: Service['servicePrices']) =>
              v && v.length > 0 ? formatCompactCurrency(v[0].price) : 'Chưa có',
            },
            { title: 'Active', dataIndex: 'isActive', width: 80, render: (v: boolean, r: Service) => <Switch checked={v} size="small" onChange={() => toggleMut.mutate(r.serviceID)} /> },
            { title: '', width: 100, render: (_: unknown, r: Service) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(r)} size="small" type="link" /><Popconfirm title="Xoá?" onConfirm={() => deleteMut.mutate(r.serviceID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
          ]}
          dataSource={query.data?.items ?? []} loading={query.isFetching} onChange={(pagination) => setTablePagination(pagination)} rowKey="serviceID" pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (t) => `Tổng ${t}` }} scroll={{ x: 700 }} size="middle"
        />
      </Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} okText={editingId ? 'Cập nhật' : 'Tạo'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sửa DV' : 'Thêm DV'} width={540} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="Mã DV" name="serviceCode" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Tên DV" name="serviceName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Loại" name="serviceType"><Input /></Form.Item>
          <Form.Item label="Đơn vị" name="unit"><Input /></Form.Item>
          <Space><Form.Item label="Min SL" name="minQuantity"><InputNumber /></Form.Item><Form.Item label="Max SL" name="maxQuantity"><InputNumber /></Form.Item></Space>
          <Form.Item label="Giá hiện tại" name="price">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
