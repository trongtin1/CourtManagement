import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
} from 'antd'
import {
  AppstoreAddOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ToolOutlined,
  InfoCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'

import { ROUTES } from '@/constants/routes'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useFacilitiesQuery } from '@/features/facilities/api/useFacilityQueries'
import { useCourtQuery } from '@/features/courts/api/useCourtQueries'
import { useCourtStatusesQuery } from '@/features/courts/api/useCourtStatusQueries'
import { useCourtTypesQuery } from '@/features/courts/api/useCourtTypeQueries'

import { CourtFeaturesSection } from './components/CourtFeaturesSection'
import { CourtHoursSection } from './components/CourtHoursSection'
import { CourtPriceSection } from './components/CourtPriceSection'
import { CourtAssetsSection } from './components/CourtAssetsSection'

const { Title, Text } = Typography

// ───────────────────────── Helpers ─────────────────────────

const sections = [
  { key: 'basic', label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
  { key: 'features', label: 'Tiện ích sân', icon: <AppstoreAddOutlined /> },
  { key: 'assets', label: 'Tài sản sân', icon: <ToolOutlined /> },
  { key: 'hours', label: 'Lịch khả dụng', icon: <CalendarOutlined /> },
  { key: 'pricing', label: 'Cấu hình giá', icon: <WalletOutlined /> },
]

type BasicFormValues = {
  courtName: string
  facilityID?: number
  courtTypeID?: number
  courtCode: string
  description?: string
  statusID?: number
  isActive: boolean
}

// ───────────────────────── Page Component ─────────────────────────

export default function CourtSettingsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm<BasicFormValues>()
  const courtId = Number(id) || 0
  const [active, setActive] = useState('basic')
  const courtQuery = useCourtQuery(courtId)

  const facilitiesQuery = useFacilitiesQuery()
  const courtTypesQuery = useCourtTypesQuery()
  const courtStatusesQuery = useCourtStatusesQuery()

  const court = courtQuery.data
  const facilities = facilitiesQuery.data?.items ?? []
  const courtTypes = courtTypesQuery.data?.items ?? []
  const courtStatuses = courtStatusesQuery.data?.items ?? []

  const initialValues: BasicFormValues = {
    courtName: court?.courtName ?? '',
    facilityID: court?.facilityID,
    courtTypeID: court?.courtTypeID,
    courtCode: court?.courtCode ?? '',
    description: court?.description ?? '',
    statusID: court?.statusID,
    isActive: court?.isActive ?? true,
  }

  if (courtQuery.isPending) return <LoadingSpin tip="Đang tải thông tin sân..." />

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <Space className="w-full" direction="vertical" size={24}>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Space align="start">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTES.courts)}
              style={{ marginTop: 6 }}
            />
            <div>
              <Title level={2} style={{ marginBottom: 4 }}>
                Cấu hình sân
              </Title>
              <Text type="secondary">
                Quản lý cấu hình, thông tin, tiện ích, giá cả của sân.
              </Text>
            </div>
          </Space>
        </div>

        <Row gutter={24}>
          <Col span={24}>
            <Tabs
              activeKey={active}
              onChange={setActive}
              items={sections.map((s) => ({
                key: s.key,
                label: (
                  <Space>
                    {s.icon}
                    {s.label}
                  </Space>
                ),
                children: (
                  <div style={{ paddingBottom: 24 }}>
                    {s.key === 'basic' && (
                      <BasicSection
                        form={form}
                        initialValues={initialValues}
                        facilities={facilities}
                        courtTypes={courtTypes}
                        courtStatuses={courtStatuses}
                      />
                    )}
                    {s.key === 'features' && <CourtFeaturesSection courtId={courtId} />}
                    {s.key === 'assets' && <CourtAssetsSection courtId={courtId} />}
                    {s.key === 'hours' && (
                      <CourtHoursSection courtId={courtId} />
                    )}
                    {s.key === 'pricing' && <CourtPriceSection courtId={courtId} />}
                  </div>
                ),
              }))}
            />
          </Col>
        </Row>
      </Space>
    </div>
  )
}

interface BasicSectionProps {
  form: FormInstance<BasicFormValues>
  initialValues: BasicFormValues
  facilities: { facilityID: number; facilityName: string; address?: string }[]
  courtTypes: { courtTypeID: number; name: string }[]
  courtStatuses: { statusID: number; statusName: string }[]
}

function BasicSection(props: BasicSectionProps) {
  return (
    <Card
      title={
        <>
          <InfoCircleOutlined /> Thông tin cơ bản
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Form
        form={props.form}
        initialValues={props.initialValues}
        key={props.initialValues.courtCode}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên sân"
              name="courtName"
              required
              rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}
              tooltip="Tên sẽ hiển thị trên trang đặt sân."
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mã sân"
              name="courtCode"
              required
              rules={[{ required: true, message: 'Vui lòng nhập mã sân' }]}
            >
              <Input placeholder="VD: BD-A1" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Chi nhánh" name="facilityID" required>
              <Select
                disabled
                options={props.facilities.map((facility) => ({
                  value: facility.facilityID,
                  label: [facility.facilityName, facility.address]
                    .filter(Boolean)
                    .join(' — '),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Môn thể thao"
              name="courtTypeID"
              required
              rules={[{ required: true, message: 'Vui lòng chọn môn thể thao' }]}
            >
              <Select
                options={props.courtTypes.map((type) => ({
                  value: type.courtTypeID,
                  label: type.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Mô tả sân" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Trạng thái sân"
          name="statusID"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select
            options={props.courtStatuses.map((status) => ({
              value: status.statusID,
              label: status.statusName,
            }))}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}
