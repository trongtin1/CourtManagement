import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Affix,
  Alert,
  App,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tabs,
  TimePicker,
  Typography,
} from 'antd'
import {
  AppstoreAddOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SaveOutlined,
  SettingOutlined,
  ToolOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { ROUTES } from '@/constants/routes'
import { CourtFeaturesSection } from './components/CourtFeaturesSection'

const { Title, Text, Paragraph } = Typography

// ───────────────────────── Mock Data ─────────────────────────

const branchOpts = [
  { value: 'ch-saigon-arena', label: 'Saigon Sports Arena — Q. Phú Nhuận' },
  { value: 'ch-thao-dien', label: 'Thảo Điền Sports Center' },
  { value: 'ch-q7', label: 'Phú Mỹ Hưng Athletic Club — Q. 7' },
]

const sportOpts = [
  { value: 'badminton', label: '🏸 Cầu lông' },
  { value: 'football', label: '⚽ Bóng đá' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'basketball', label: '🏀 Bóng rổ' },
  { value: 'pickleball', label: '🥒 Pickleball' },
]

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

const sections = [
  { key: 'basic', label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
  { key: 'features', label: 'Tiện ích sân', icon: <AppstoreAddOutlined /> },
  { key: 'hours', label: 'Giờ hoạt động', icon: <ClockCircleOutlined /> },
  { key: 'rules', label: 'Quy tắc đặt sân', icon: <SafetyOutlined /> },
  { key: 'pricing', label: 'Cấu hình giá', icon: <WalletOutlined /> },
  { key: 'availability', label: 'Lịch khả dụng', icon: <CalendarOutlined /> },
  { key: 'maintenance', label: 'Bảo trì', icon: <ToolOutlined /> },
  { key: 'display', label: 'Hiển thị', icon: <EyeOutlined /> },
  { key: 'advanced', label: 'Nâng cao', icon: <SettingOutlined /> },
]

// ───────────────────────── Page Component ─────────────────────────

export default function CourtSettingsPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { id } = useParams()
  const courtId = Number(id) || 0
  const [active, setActive] = useState('basic')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // -- State (Mock Data) --
  // basic
  const [name, setName] = useState('Sân Cầu Lông A1')
  const [branch, setBranch] = useState('ch-saigon-arena')
  const [sport, setSport] = useState('badminton')
  const [code, setCode] = useState('BD-A1')
  const [desc, setDesc] = useState(
    'Sân tiêu chuẩn BWF, mặt sàn PVC chống trơn, đèn LED 1200 lux.',
  )
  const [status, setStatus] = useState('active')

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

  // rules
  const [rules, setRules] = useState({
    minDur: 60,
    maxDur: 180,
    step: 30,
    advanceDays: 14,
    cancelHours: 4,
    deposit: true,
    depositPct: 30,
    autoCancel: true,
    checkin: false,
    recurring: true,
  })

  // pricing
  const [pricingRules, setPricingRules] = useState([
    {
      id: 1,
      label: 'Giờ thấp điểm',
      from: '06:00',
      to: '16:00',
      price: 120000,
      peak: false,
      days: ['T2', 'T3', 'T4', 'T5', 'T6'],
      priority: 2,
    },
    {
      id: 2,
      label: 'Giờ vàng',
      from: '17:00',
      to: '22:00',
      price: 220000,
      peak: true,
      days: ['T2', 'T3', 'T4', 'T5', 'T6'],
      priority: 1,
    },
    {
      id: 3,
      label: 'Cuối tuần',
      from: '06:00',
      to: '22:00',
      price: 250000,
      peak: true,
      days: ['T7', 'CN'],
      priority: 1,
    },
  ])

  // display
  const [display, setDisplay] = useState({
    public: true,
    highlight: true,
    showPrice: true,
    showSlots: true,
    showReviews: true,
    featured: true,
    customName: 'Sân A1 — VIP cầu lông',
    order: 1,
  })

  // advanced
  const [advanced, setAdvanced] = useState({
    memberPricing: true,
    dailyLimit: 3,
    staffApproval: false,
    autoAssign: true,
    buffer: 10,
  })

  const markDirty = () => setDirty(true)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setDirty(false)
      message.success('Đã lưu cấu hình thành công')
    }, 1000)
  }

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
          <Space>
            {dirty && (
              <Badge
                color="orange"
                text="Có thay đổi chưa lưu"
                style={{ marginRight: 16 }}
              />
            )}
            <Button icon={<CopyOutlined />}>Sao chép</Button>
            <Button icon={<ReloadOutlined />} onClick={() => setDirty(false)}>
              Đặt lại
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              Lưu cấu hình
            </Button>
          </Space>
        </div>

        <Row gutter={24}>
          <Col span={18}>
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
                  <div onChange={markDirty} style={{ paddingBottom: 24 }}>
                    {s.key === 'basic' && (
                      <BasicSection
                        name={name}
                        setName={setName}
                        branch={branch}
                        setBranch={setBranch}
                        sport={sport}
                        setSport={setSport}
                        code={code}
                        setCode={setCode}
                        desc={desc}
                        setDesc={setDesc}
                        status={status}
                        setStatus={setStatus}
                      />
                    )}
                    {s.key === 'features' && (
                      <CourtFeaturesSection courtId={courtId} />
                    )}
                    {s.key === 'hours' && (
                      <HoursSection schedule={schedule} setSchedule={setSchedule} />
                    )}
                    {s.key === 'rules' && (
                      <RulesSection rules={rules} setRules={setRules} />
                    )}
                    {s.key === 'pricing' && (
                      <PricingSection rules={pricingRules} setRules={setPricingRules} />
                    )}
                    {s.key === 'availability' && <AvailabilitySection />}
                    {s.key === 'maintenance' && <MaintenanceSection />}
                    {s.key === 'display' && (
                      <DisplaySection display={display} setDisplay={setDisplay} />
                    )}
                    {s.key === 'advanced' && (
                      <AdvancedSection advanced={advanced} setAdvanced={setAdvanced} />
                    )}
                  </div>
                ),
              }))}
            />
          </Col>

          {/* Right Preview */}
          <Col span={6}>
            <Affix offsetTop={80}>
              <PreviewPanel
                name={display.customName || name}
                sport={sport}
                status={status}
                features={[...env, ...surface, ...quality]}
                schedule={schedule}
                pricing={pricingRules}
              />
            </Affix>
          </Col>
        </Row>
      </Space>
    </div>
  )
}

// ───────────────────────── Sections ─────────────────────────

function BasicSection(props: any) {
  return (
    <Card
      title={
        <>
          <InfoCircleOutlined /> Thông tin cơ bản
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên sân"
              required
              tooltip="Tên sẽ hiển thị trên trang đặt sân."
            >
              <Input value={props.name} onChange={(e) => props.setName(e.target.value)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mã sân" required>
              <Input
                value={props.code}
                onChange={(e) => props.setCode(e.target.value)}
                placeholder="VD: BD-A1"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Chi nhánh" required>
              <Select
                value={props.branch}
                onChange={props.setBranch}
                options={branchOpts}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Môn thể thao" required>
              <Select value={props.sport} onChange={props.setSport} options={sportOpts} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Mô tả sân">
          <Input.TextArea
            value={props.desc}
            onChange={(e) => props.setDesc(e.target.value)}
            rows={3}
          />
        </Form.Item>
        <Form.Item label="Trạng thái sân">
          <Select
            value={props.status}
            onChange={props.setStatus}
            options={[
              { value: 'active', label: 'Hoạt động' },
              { value: 'paused', label: 'Tạm dừng' },
              { value: 'closed', label: 'Đóng cửa' },
            ]}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}

function HoursSection({ schedule, setSchedule }: any) {
  const update = (i: number, patch: any) => {
    const next = [...schedule]
    next[i] = { ...next[i], ...patch }
    setSchedule(next)
  }
  return (
    <Card
      title={
        <>
          <ClockCircleOutlined /> Giờ hoạt động
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {schedule.map((d: any, i: number) => (
          <Card
            key={d.day}
            size="small"
            type="inner"
            style={{ background: d.open ? '#fff' : '#f5f5f5', borderRadius: 8 }}
          >
            <Row
              align="middle"
              justify="space-between"
              style={{ marginBottom: d.open ? 16 : 0 }}
            >
              <Space>
                <Switch checked={d.open} onChange={(b) => update(i, { open: b })} />
                <Text strong>{d.day}</Text>
              </Space>
              {d.open && (
                <Button type="link" size="small" icon={<CopyOutlined />}>
                  Sao chép
                </Button>
              )}
            </Row>
            {d.open && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Mở cửa" style={{ marginBottom: 0 }}>
                    <TimePicker
                      value={dayjs(d.start, 'HH:mm')}
                      format="HH:mm"
                      onChange={(_, ts) => update(i, { start: ts })}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Đóng cửa" style={{ marginBottom: 0 }}>
                    <TimePicker
                      value={dayjs(d.end, 'HH:mm')}
                      format="HH:mm"
                      onChange={(_, ts) => update(i, { end: ts })}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Card>
        ))}
      </Space>
    </Card>
  )
}

function RulesSection({ rules, setRules }: any) {
  const set = (k: string, v: any) => setRules({ ...rules, [k]: v })
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={24}>
      <Card
        title={
          <>
            <SafetyOutlined /> Quy tắc đặt sân
          </>
        }
        style={{ borderRadius: 8 }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={`Thời lượng tối thiểu (${rules.minDur} phút)`}>
              <Slider
                value={rules.minDur}
                onChange={(v) => set('minDur', v)}
                min={30}
                max={180}
                step={15}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={`Thời lượng tối đa (${rules.maxDur} phút)`}>
              <Slider
                value={rules.maxDur}
                onChange={(v) => set('maxDur', v)}
                min={60}
                max={360}
                step={30}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Bước thời gian (phút)">
              <Select
                value={rules.step}
                onChange={(v) => set('step', v)}
                options={[
                  { value: 15, label: '15p' },
                  { value: 30, label: '30p' },
                  { value: 60, label: '60p' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={`Đặt trước tối đa (${rules.advanceDays} ngày)`}>
              <Slider
                value={rules.advanceDays}
                onChange={(v) => set('advanceDays', v)}
                min={1}
                max={60}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Card style={{ borderRadius: 8 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Yêu cầu đặt cọc</Text>
                <Switch checked={rules.deposit} onChange={(v) => set('deposit', v)} />
              </div>
              {rules.deposit && (
                <Form.Item
                  label={`Tỉ lệ cọc (${rules.depositPct}%)`}
                  style={{ marginBottom: 0 }}
                >
                  <Slider
                    value={rules.depositPct}
                    onChange={(v) => set('depositPct', v)}
                    min={10}
                    max={100}
                    step={10}
                  />
                </Form.Item>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Tự động hủy chưa thanh toán</Text>
                <Switch
                  checked={rules.autoCancel}
                  onChange={(v) => set('autoCancel', v)}
                />
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Yêu cầu check-in tại quầy</Text>
                <Switch checked={rules.checkin} onChange={(v) => set('checkin', v)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Cho phép đặt lịch lặp lại</Text>
                <Switch checked={rules.recurring} onChange={(v) => set('recurring', v)} />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  )
}

function PricingSection({ rules, setRules }: any) {
  const remove = (id: number) => setRules(rules.filter((r: any) => r.id !== id))
  return (
    <Card
      title={
        <>
          <WalletOutlined /> Cấu hình giá
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {rules.map((r: any) => (
          <Card key={r.id} type="inner" size="small" style={{ borderRadius: 8 }}>
            <Row align="middle" gutter={16}>
              <Col span={5}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tên quy tắc
                </Text>
                <Input value={r.label} />
              </Col>
              <Col span={6}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Khung giờ
                </Text>
                <div style={{ display: 'flex', gap: 4 }}>
                  <TimePicker
                    value={dayjs(r.from, 'HH:mm')}
                    format="HH:mm"
                    style={{ width: '100%' }}
                  />
                  <TimePicker
                    value={dayjs(r.to, 'HH:mm')}
                    format="HH:mm"
                    style={{ width: '100%' }}
                  />
                </div>
              </Col>
              <Col span={5}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Giá (VNĐ)
                </Text>
                <Input value={r.price} type="number" />
              </Col>
              <Col span={6}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Áp dụng ngày
                </Text>
                <Select
                  mode="multiple"
                  value={r.days}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                  options={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => ({
                    value: d,
                    label: d,
                  }))}
                />
              </Col>
              <Col span={2} style={{ textAlign: 'right' }}>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(r.id)}
                  style={{ marginTop: 20 }}
                />
              </Col>
            </Row>
          </Card>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />}>
          Thêm quy tắc giá
        </Button>
      </Space>
    </Card>
  )
}

function AvailabilitySection() {
  return (
    <Card
      title={
        <>
          <CalendarOutlined /> Lịch khả dụng
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary">
        Cấu hình các ngày khóa sân hoặc khung giờ đóng cửa đột xuất.
      </Paragraph>
      <Alert message="Chức năng đang được tích hợp..." type="info" showIcon />
    </Card>
  )
}

function MaintenanceSection() {
  return (
    <Card
      title={
        <>
          <ToolOutlined /> Bảo trì
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Lý do bảo trì">
              <Select
                value="surface"
                options={[{ value: 'surface', label: 'Sửa chữa mặt sân' }]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thông báo khách hàng">
              <Switch defaultChecked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

function DisplaySection({ display, setDisplay }: any) {
  const set = (k: string, v: any) => setDisplay({ ...display, [k]: v })
  return (
    <Card
      title={
        <>
          <EyeOutlined /> Hiển thị
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Tên hiển thị">
            <Input
              value={display.customName}
              onChange={(e) => set('customName', e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Thứ tự">
            <Input
              type="number"
              value={display.order}
              onChange={(e) => set('order', Number(e.target.value))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Switch checked={display.public} onChange={(v) => set('public', v)} /> Hiển thị
          trang khách
        </Col>
        <Col span={12}>
          <Switch checked={display.highlight} onChange={(v) => set('highlight', v)} /> Làm
          nổi bật
        </Col>
        <Col span={12}>
          <Switch checked={display.showPrice} onChange={(v) => set('showPrice', v)} />{' '}
          Hiển thị giá
        </Col>
        <Col span={12}>
          <Switch checked={display.showSlots} onChange={(v) => set('showSlots', v)} />{' '}
          Hiển thị giờ trống
        </Col>
      </Row>
    </Card>
  )
}

function AdvancedSection({ advanced, setAdvanced }: any) {
  const set = (k: string, v: any) => setAdvanced({ ...advanced, [k]: v })
  return (
    <Card
      title={
        <>
          <SettingOutlined /> Nâng cao
        </>
      }
      style={{ borderRadius: 8 }}
    >
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Giá theo hạng thành viên</Text>
              <Switch
                checked={advanced.memberPricing}
                onChange={(v) => set('memberPricing', v)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Tự động phân công nhân viên</Text>
              <Switch
                checked={advanced.autoAssign}
                onChange={(v) => set('autoAssign', v)}
              />
            </div>
          </Space>
        </Col>
        <Col span={12}>
          <Form.Item label={`Giới hạn lượt đặt mỗi ngày (${advanced.dailyLimit})`}>
            <Slider
              value={advanced.dailyLimit}
              onChange={(v) => set('dailyLimit', v)}
              min={1}
              max={10}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={`Thời gian đệm (${advanced.buffer}p)`}>
            <Slider
              value={advanced.buffer}
              onChange={(v) => set('buffer', v)}
              min={0}
              max={60}
              step={5}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  )
}

function PreviewPanel({ name, status, features, pricing }: any) {
  const prices = pricing.map((p: any) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

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
          status={status === 'active' ? 'success' : 'default'}
          text={status === 'active' ? 'Đang hoạt động' : 'Đóng cửa'}
        />
        <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>
          {name}
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Saigon Sports Arena
        </Text>

        <Divider style={{ margin: '12px 0' }} />

        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
        >
          <Text type="secondary">Khoảng giá</Text>
          <Text strong type="success">
            {fmtVND(min)} - {fmtVND(max)}
          </Text>
        </div>

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
