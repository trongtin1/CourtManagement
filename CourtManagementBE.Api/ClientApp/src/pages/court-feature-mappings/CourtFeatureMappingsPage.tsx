import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useCourtFeaturesQuery } from '@/features/courts/api/useCourtFeatureQueries'
import {
  useCourtFeatureMappingsByCourtQuery,
  useCreateCourtFeatureMappingMutation,
  useDeleteCourtFeatureMappingMutation,
} from '@/features/courts/api/useCourtFeatureMappingQueries'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import type { CourtFeatureMapping } from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtFeatureMappingsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [courtId, setCourtId] = useState<number>(0)
  const courtsQuery = useCourtsQuery()
  const featuresQuery = useCourtFeaturesQuery()
  const mappingsQuery = useCourtFeatureMappingsByCourtQuery(courtId)
  const createMut = useCreateCourtFeatureMappingMutation()
  const deleteMut = useDeleteCourtFeatureMappingMutation()

  const courts = useMemo(() => courtsQuery.data?.items ?? [], [courtsQuery.data?.items])
  const features = useMemo(
    () => featuresQuery.data?.items ?? [],
    [featuresQuery.data?.items],
  )
  const mappings = useMemo(() => mappingsQuery.data ?? [], [mappingsQuery.data])
  const selectedFeatureIds = useMemo(
    () => new Set(mappings.map((item) => item.courtFeatureID)),
    [mappings],
  )
  const featureById = useMemo(
    () => new Map(features.map((item) => [item.courtFeatureID, item])),
    [features],
  )

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await createMut.mutateAsync({
        courtID: courtId,
        courtFeatureID: values.courtFeatureID,
      })
      form.resetFields(['courtFeatureID'])
      message.success('Gan dac tinh san thanh cong')
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Go dac tinh khoi san thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (courtsQuery.isPending || featuresQuery.isPending) {
    return <LoadingSpin tip="Dang tai du lieu san..." />
  }

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Gan dac tinh san</Typography.Title>
          <Typography.Paragraph type="secondary">
            Chon san va gan cac dac tinh theo nhom Environment, Surface, Property.
          </Typography.Paragraph>
        </div>
        <Button
          icon={<ReloadOutlined />}
          loading={
            mappingsQuery.isRefetching ||
            courtsQuery.isRefetching ||
            featuresQuery.isRefetching
          }
          onClick={() => {
            courtsQuery.refetch()
            featuresQuery.refetch()
            if (courtId > 0) mappingsQuery.refetch()
          }}
        >
          Lam moi
        </Button>
      </div>

      <Card>
        <Space className="w-full" direction="vertical" size={16}>
          <div className="grid gap-4 md:grid-cols-[minmax(240px,360px)_1fr_auto]">
            <Select
              allowClear
              onChange={(value) => {
                setCourtId(value ?? 0)
                form.resetFields()
              }}
              options={courts.map((court) => ({
                label: `${court.courtCode} - ${court.courtName}`,
                value: court.courtID,
              }))}
              placeholder="Chon san"
              showSearch
              optionFilterProp="label"
              value={courtId || undefined}
            />
            <Form form={form}>
              <Form.Item
                className="mb-0"
                name="courtFeatureID"
                rules={[{ required: true, message: 'Chon dac tinh' }]}
              >
                <Select
                  disabled={!courtId}
                  options={features.map((feature) => ({
                    disabled: selectedFeatureIds.has(feature.courtFeatureID),
                    label: `${feature.featureCode} - ${feature.featureName} (${feature.courtFeatureCategory?.name ?? 'Other'})`,
                    value: feature.courtFeatureID,
                  }))}
                  placeholder="Chon dac tinh de gan"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Form>
            <Button
              disabled={!courtId}
              icon={<PlusOutlined />}
              loading={createMut.isPending}
              onClick={handleCreate}
              type="primary"
            >
              Gan
            </Button>
          </div>

          <Table
            columns={[
              { title: 'ID', dataIndex: 'courtFeatureMappingID', width: 80 },
              {
                title: 'Ma',
                width: 160,
                render: (_: unknown, record: CourtFeatureMapping) => {
                  const feature = featureById.get(record.courtFeatureID)
                  return (
                    <Tag color="blue">
                      {feature?.featureCode ?? record.courtFeatureID}
                    </Tag>
                  )
                },
              },
              {
                title: 'Ten dac tinh',
                render: (_: unknown, record: CourtFeatureMapping) =>
                  featureById.get(record.courtFeatureID)?.featureName ??
                  record.courtFeatureID,
              },
              {
                title: 'Nhom',
                width: 150,
                render: (_: unknown, record: CourtFeatureMapping) => {
                  const feature = featureById.get(record.courtFeatureID)
                  return <Tag color="purple">{feature?.courtFeatureCategory?.name || 'Other'}</Tag>
                },
              },
              {
                title: '',
                width: 80,
                render: (_: unknown, record: CourtFeatureMapping) => (
                  <Popconfirm
                    title="Go dac tinh khoi san?"
                    onConfirm={() => handleDelete(record.courtFeatureMappingID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={courtId ? mappings : []}
            loading={mappingsQuery.isFetching}
            locale={{
              emptyText: courtId ? 'Chua co dac tinh' : 'Chon san de xem dac tinh',
            }}
            pagination={false}
            rowKey="courtFeatureMappingID"
            scroll={{ x: 720 }}
          />
        </Space>
      </Card>
    </Space>
  )
}
