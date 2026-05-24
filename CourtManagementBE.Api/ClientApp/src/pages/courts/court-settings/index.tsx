import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Affix,
  Badge,
  Button,
  Card,
  Col,
  Divider,
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
  ClockCircleOutlined,
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
import type { PriceBlock } from './components/CourtPriceSection'

const { Title, Text } = Typography

// ───────────────────────── Helpers ─────────────────────────

const getWeekDates = () => {
  const currentDayIndex = dayjs().day()
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex
  const currentMonday = dayjs().add(mondayOffset, 'day')
  return Array.from({ length: 7 }, (_, i) => {
    const date = currentMonday.add(i, 'day')
    const dayName = i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`
    return `${dayName} (${date.format('DD/MM')})`
  })
}

const days = getWeekDates()

const sections = [
  { key: 'basic', label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
  { key: 'features', label: 'Tiện ích sân', icon: <AppstoreAddOutlined /> },
  { key: 'hours', label: 'Giờ hoạt động', icon: <ClockCircleOutlined /> },
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

  const [previewValues, setPreviewValues] = useState<Partial<BasicFormValues>>({})

  // features
  const [env] = useState<string[]>(['indoor', 'air'])
  const [surface] = useState<string[]>(['wood'])
  const [quality] = useState<string[]>(['competition', 'private'])

  // hours
  const [schedule, setSchedule] = useState(
    days.map((d) => ({
      day: d,
      open: true,
      start: '06:00',
      end: '22:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      hasBreak: false,
    })),
  )

  // pricing — dữ liệu thực load từ API qua CourtPriceSection
  const [pricingRules, setPricingRules] = useState<PriceBlock[]>([])

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
  const currentValues = { ...initialValues, ...previewValues }
  const selectedFacility = facilities.find(
    (facility) => facility.facilityID === currentValues.facilityID,
  )
  const selectedStatus = courtStatuses.find(
    (item) => item.statusID === currentValues.statusID,
  )

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
          <Col span={active === 'pricing' ? 24 : 18}>
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
                        onValuesChange={(_changed, values) => {
                          setPreviewValues(values)
                        }}
                      />
                    )}
                    {s.key === 'features' && <CourtFeaturesSection courtId={courtId} />}
                    {s.key === 'hours' && (
                      <CourtHoursSection schedule={schedule} setSchedule={setSchedule} />
                    )}
                    {s.key === 'pricing' && (
                      <CourtPriceSection
                        courtId={courtId}
            
                        setRules={setPricingRules}
                      />
                    )}
                  </div>
                ),
              }))}
            />
          </Col>

          {/* Right Preview */}
          {active !== 'pricing' && (
            <Col span={6}>
              <Affix offsetTop={80}>
                <PreviewPanel
                  name={currentValues.courtName}
                  sport={currentValues.courtTypeID}
                  status={currentValues.statusID}
                  statusText={selectedStatus?.statusName}
                  facilityName={selectedFacility?.facilityName}
                  features={[...env, ...surface, ...quality]}
                  schedule={schedule}
                  pricing={pricingRules}
                />
              </Affix>
            </Col>
          )}
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
  onValuesChange: (
    changedValues: Partial<BasicFormValues>,
    values: BasicFormValues,
  ) => void
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
        onValuesChange={props.onValuesChange}
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

interface ScheduleItem {
  day: string
  open: boolean
  start: string
  end: string
  breakStart: string
  breakEnd: string
  hasBreak: boolean
}

interface PreviewPanelProps {
  name: string
  sport?: number
  status?: number
  statusText?: string
  facilityName?: string
  features: string[]
  schedule: ScheduleItem[]
  pricing: PriceBlock[]
}

function PreviewPanel({ name, statusText, facilityName, features }: PreviewPanelProps) {
  const normalizedStatus = statusText?.toLowerCase() ?? ''
  const isActiveStatus =
    normalizedStatus.includes('hoạt động') || normalizedStatus.includes('active')

  return (
    <Card title="Xem trước hiển thị" style={{ borderRadius: 8, background: '#fafafa' }}>
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          border: '1px solid #e8e8e8',
        }}
      >
        <Badge
          status={isActiveStatus ? 'success' : 'default'}
          text={statusText ?? 'Chưa có trạng thái'}
        />
        <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>
          {name}
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {facilityName ?? 'Chưa có chi nhánh'}
        </Text>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {features.slice(0, 5).map((f: string) => (
            <Badge
              key={f}
              count={f}
              style={{ backgroundColor: '#f0f0f0', color: '#595959', fontSize: 10 }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
