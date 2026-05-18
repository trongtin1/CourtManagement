import { useMemo, useState } from 'react'
import { App, Alert, Badge, Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd'
import { AppstoreAddOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons'

import { useCourtFeaturesQuery } from '@/features/courts/api/useCourtFeatureQueries'
import {
  useCourtFeatureMappingsByCourtQuery,
  useCreateCourtFeatureMappingMutation,
  useDeleteCourtFeatureMappingMutation,
} from '@/features/courts/api/useCourtFeatureMappingQueries'
import type { CourtFeature, CourtFeatureMapping } from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

const { Text, Paragraph } = Typography

type CourtFeaturesSectionProps = {
  courtId: number
}

type FeatureGroup = {
  category: string
  features: CourtFeature[]
}

const getFeatureCategory = (feature: CourtFeature) =>
  feature.courtFeatureCategory?.name?.trim() || 'Khác'

const groupFeatures = (features: CourtFeature[]): FeatureGroup[] => {
  const map = new Map<string, CourtFeature[]>()

  features.forEach((feature) => {
    const category = getFeatureCategory(feature)
    const group = map.get(category) ?? []
    group.push(feature)
    map.set(category, group)
  })

  return Array.from(map.entries()).map(([category, group]) => ({
    category,
    features: group.sort((a, b) => a.featureName.localeCompare(b.featureName)),
  }))
}

export function CourtFeaturesSection({ courtId }: CourtFeaturesSectionProps) {
  const { message } = App.useApp()
  const [updatingFeatureId, setUpdatingFeatureId] = useState<number | null>(null)

  const featuresQuery = useCourtFeaturesQuery({ page: 1, pageSize: 200 })
  const mappingsQuery = useCourtFeatureMappingsByCourtQuery(courtId, courtId > 0)
  const createMapping = useCreateCourtFeatureMappingMutation()
  const deleteMapping = useDeleteCourtFeatureMappingMutation()

  const activeFeatures = useMemo(
    () => (featuresQuery.data?.items ?? []).filter((feature) => feature.isActive),
    [featuresQuery.data?.items],
  )
  const mappings = useMemo(() => mappingsQuery.data ?? [], [mappingsQuery.data])
  const mappingByFeatureId = useMemo(
    () =>
      new Map<number, CourtFeatureMapping>(
        mappings.map((mapping) => [mapping.courtFeatureID, mapping]),
      ),
    [mappings],
  )
  const selectedFeatureIds = useMemo(
    () => new Set(mappings.map((mapping) => mapping.courtFeatureID)),
    [mappings],
  )
  const featureGroups = useMemo(() => groupFeatures(activeFeatures), [activeFeatures])

  const handleToggle = async (feature: CourtFeature) => {
    if (!courtId) return

    setUpdatingFeatureId(feature.courtFeatureID)
    try {
      const mapping = mappingByFeatureId.get(feature.courtFeatureID)

      if (mapping) {
        await deleteMapping.mutateAsync(mapping.courtFeatureMappingID)
        message.success('Đã gỡ đặc điểm khỏi sân')
      } else {
        await createMapping.mutateAsync({
          courtID: courtId,
          courtFeatureID: feature.courtFeatureID,
        })
        message.success('Đã gán đặc điểm cho sân')
      }
    } catch (error) {
      message.error(toApiError(error).message)
    } finally {
      setUpdatingFeatureId(null)
    }
  }

  const isLoading = featuresQuery.isPending || mappingsQuery.isPending
  const isRefreshing = featuresQuery.isRefetching || mappingsQuery.isRefetching

  return (
    <Card
      extra={
        <Button
          icon={<ReloadOutlined />}
          loading={isRefreshing}
          onClick={() => {
            featuresQuery.refetch()
            if (courtId > 0) mappingsQuery.refetch()
          }}
        >
          Làm mới
        </Button>
      }
      title={
        <>
          <AppstoreAddOutlined /> Tiện ích sân
        </>
      }
      style={{ borderRadius: 8 }}
    >
      {!courtId && (
        <Alert
          message="Không xác định được sân"
          description="Mở trang cấu hình từ một sân cụ thể để gán đặc điểm sân."
          showIcon
          type="warning"
        />
      )}

      {courtId > 0 && (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div className="flex items-center justify-between">
            <Paragraph style={{ marginBottom: 0 }} type="secondary">
              Chọn các đặc điểm đã khai báo trong Master Data để gán cho sân này.
            </Paragraph>
            <Badge
              color="blue"
              text={`${selectedFeatureIds.size} đặc điểm đã chọn`}
            />
          </div>

          <Spin spinning={isLoading}>
            {featureGroups.length === 0 ? (
              <Empty description="Chưa có đặc điểm sân đang hoạt động" />
            ) : (
              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                {featureGroups.map((group) => (
                  <div key={group.category}>
                    <div className="mb-2 flex items-center gap-2">
                      <Text strong>{group.category}</Text>
                      <Tag>{group.features.length}</Tag>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {group.features.map((feature) => {
                        const selected = selectedFeatureIds.has(feature.courtFeatureID)
                        const loading = updatingFeatureId === feature.courtFeatureID

                        return (
                          <Button
                            icon={selected ? <CheckOutlined /> : undefined}
                            key={feature.courtFeatureID}
                            loading={loading}
                            onClick={() => handleToggle(feature)}
                            type={selected ? 'primary' : 'default'}
                          >
                            {feature.featureName}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </Space>
            )}
          </Spin>
        </Space>
      )}
    </Card>
  )
}
