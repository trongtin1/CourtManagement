import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Info,
  Sparkles,
  Clock,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Wrench,
  Eye,
  Settings2,
  ImagePlus,
  Copy,
  Plus,
  Trash2,
  Check,
  X,
  Star,
  Wind,
  Snowflake,
  Home as HomeIcon,
  Sun,
  Trees,
  Square,
  Crown,
  GraduationCap,
  Trophy,
  Baby,
  Lock,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  FileText,
  Files,
  Layers,
  AlertTriangle,
  CircleCheck,
  MapPin,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react'
import branchImg from '@/assets/court-badminton.jpg'

export const Route = createFileRoute('/admin/court-settings')({
  head: () => ({
    meta: [
      { title: 'Cấu hình sân — CourtHub Admin' },
      {
        name: 'description',
        content:
          'Quản lý cấu hình sân thể thao: thông tin, tiện ích, giờ hoạt động, giá, lịch và quy tắc đặt sân.',
      },
    ],
  }),
  component: CourtSettingsPage,
})

/* ───────────────────────── UI Primitives ───────────────────────── */

function cls(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cls(
        'rounded-2xl bg-card border border-border/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
  accent = 'orange',
}: {
  icon: any
  title: string
  desc?: string
  accent?: 'orange' | 'blue' | 'slate'
}) {
  const tones = {
    orange: 'bg-primary/10 text-primary',
    blue: 'bg-[oklch(0.93_0.04_240)] text-[oklch(0.45_0.18_250)]',
    slate: 'bg-secondary/10 text-secondary',
  } as const
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className={cls(
          'h-10 w-10 rounded-xl grid place-items-center shrink-0',
          tones[accent],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-primary">*</span>}
        </span>
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cls(
        'w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm',
        'outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15',
        props.className,
      )}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cls(
        'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm',
        'outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 min-h-[88px]',
        props.className,
      )}
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3.5 pr-9 rounded-xl border border-border bg-background text-sm appearance-none focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean
  onChange: (b: boolean) => void
  label?: string
  desc?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      {label && (
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cls(
          'relative h-6 w-11 rounded-full transition shrink-0',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cls(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {min}
          {suffix}
        </span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {value}
          {suffix}
        </span>
        <span className="text-xs text-muted-foreground">
          {max}
          {suffix}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary-glow"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  )
}

function Btn({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: {
  variant?: 'primary' | 'ghost' | 'outline' | 'dark'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary:
      'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_8px_20px_-6px_oklch(0.68_0.2_45/0.5)]',
    ghost: 'text-foreground hover:bg-muted',
    outline: 'border border-border bg-background hover:bg-muted',
    dark: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  } as const
  return (
    <button
      {...rest}
      className={cls(
        'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

function Chip({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon?: any
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        'group relative inline-flex items-center gap-2 px-3.5 h-10 rounded-xl border text-sm font-medium transition-all',
        active
          ? 'border-primary bg-primary/8 text-primary shadow-[0_4px_14px_-6px_oklch(0.68_0.2_45/0.45)]'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/60',
      )}
    >
      {Icon && (
        <Icon
          className={cls('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')}
        />
      )}
      <span>{label}</span>
      {active && (
        <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center animate-[scale-in_0.2s_ease-out]">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

function Badge({
  tone = 'slate',
  children,
}: {
  tone?: 'slate' | 'orange' | 'blue' | 'green' | 'amber'
  children: React.ReactNode
}) {
  const tones = {
    slate: 'bg-secondary/10 text-secondary',
    orange: 'bg-primary/12 text-primary',
    blue: 'bg-[oklch(0.93_0.04_240)] text-[oklch(0.4_0.18_250)]',
    green: 'bg-success/15 text-success',
    amber: 'bg-[oklch(0.95_0.1_85)] text-[oklch(0.5_0.16_70)]',
  } as const
  return (
    <span
      className={cls(
        'inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

/* ───────────────────────── Page ───────────────────────── */

const sections = [
  { id: 'basic', label: 'Thông tin cơ bản', icon: Info },
  { id: 'features', label: 'Tiện ích sân', icon: Sparkles },
  { id: 'hours', label: 'Giờ hoạt động', icon: Clock },
  { id: 'rules', label: 'Quy tắc đặt sân', icon: ShieldCheck },
  { id: 'pricing', label: 'Cấu hình giá', icon: Wallet },
  { id: 'availability', label: 'Lịch khả dụng', icon: CalendarDays },
  { id: 'maintenance', label: 'Bảo trì', icon: Wrench },
  { id: 'display', label: 'Hiển thị', icon: Eye },
  { id: 'advanced', label: 'Nâng cao', icon: Settings2 },
] as const

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫'

function CourtSettingsPage() {
  const [active, setActive] = useState<string>('basic')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

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
  const [env, setEnv] = useState<string[]>(['indoor', 'air'])
  const [surface, setSurface] = useState<string[]>(['wood'])
  const [quality, setQuality] = useState<string[]>(['competition', 'private'])

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
  const [minDur, setMinDur] = useState(60)
  const [maxDur, setMaxDur] = useState(180)
  const [step, setStep] = useState(30)
  const [advanceDays, setAdvanceDays] = useState(14)
  const [cancelHours, setCancelHours] = useState(4)
  const [deposit, setDeposit] = useState(true)
  const [depositPct, setDepositPct] = useState(30)
  const [autoCancel, setAutoCancel] = useState(true)
  const [checkin, setCheckin] = useState(false)
  const [recurring, setRecurring] = useState(true)

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

  // availability
  const [blockedDays, setBlockedDays] = useState<number[]>([12, 13, 24])

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

  const markDirty = () => {
    setDirty(true)
    setSaved(false)
  }

  const handleSave = () => {
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.005_240)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-[0_8px_20px_-6px_oklch(0.68_0.2_45/0.5)]">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest">
                CourtHub Admin
              </div>
              <h1 className="text-base md:text-lg font-semibold truncate">
                Cấu hình sân
              </h1>
            </div>
            <Badge tone="orange">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Đang chỉnh sửa
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
              <span
                className={cls(
                  'h-2 w-2 rounded-full',
                  dirty ? 'bg-amber-500 animate-pulse' : 'bg-success',
                )}
              />
              {saved ? 'Đã lưu' : dirty ? 'Có thay đổi chưa lưu' : 'Đã đồng bộ'}
            </div>
            <Btn variant="ghost">
              <Files className="h-4 w-4" /> Sao chép từ sân khác
            </Btn>
            <Btn variant="outline">
              <Layers className="h-4 w-4" /> Áp dụng cho nhiều sân
            </Btn>
            <Btn variant="outline" onClick={() => setDirty(false)}>
              <RotateCcw className="h-4 w-4" /> Đặt lại
            </Btn>
            <Btn variant="ghost">
              <FileText className="h-4 w-4" /> Lưu nháp
            </Btn>
            <Btn onClick={handleSave}>
              <Save className="h-4 w-4" /> Lưu cấu hình
            </Btn>
          </div>
        </div>
      </header>

      {/* Saved toast */}
      {saved && (
        <div className="fixed top-20 right-6 z-50 animate-[scale-in_0.25s_ease-out]">
          <div className="flex items-center gap-2 bg-success text-success-foreground px-4 py-2.5 rounded-xl shadow-elegant">
            <CircleCheck className="h-4 w-4" /> Đã lưu cấu hình thành công
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left nav */}
        <aside className="hidden lg:block col-span-3 xl:col-span-2">
          <div className="sticky top-24">
            <Card className="p-2">
              <nav className="flex flex-col gap-0.5">
                {sections.map((s) => {
                  const isActive = active === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={cls(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                        isActive
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-foreground/75 hover:bg-muted',
                      )}
                    >
                      <s.icon
                        className={cls(
                          'h-4 w-4',
                          isActive ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span className="flex-1 text-left">{s.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </button>
                  )
                })}
              </nav>
            </Card>

            <Card className="mt-4 p-4 bg-gradient-to-br from-primary/8 to-primary/0">
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                Mẹo
              </div>
              <div className="text-sm text-foreground/80">
                Bạn có thể sao chép toàn bộ cấu hình từ sân tương tự để tiết kiệm thời
                gian.
              </div>
            </Card>
          </div>
        </aside>

        {/* Mobile section selector */}
        <div className="lg:hidden col-span-12 -mb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cls(
                  'inline-flex items-center gap-2 px-3.5 h-10 rounded-full text-sm font-medium whitespace-nowrap border transition',
                  active === s.id
                    ? 'bg-secondary text-secondary-foreground border-secondary'
                    : 'bg-card border-border text-foreground/70',
                )}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center content */}
        <main
          className="col-span-12 lg:col-span-9 xl:col-span-7 space-y-6"
          onChange={markDirty}
        >
          {active === 'basic' && (
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
          {active === 'features' && (
            <FeaturesSection
              env={env}
              setEnv={setEnv}
              surface={surface}
              setSurface={setSurface}
              quality={quality}
              setQuality={setQuality}
            />
          )}
          {active === 'hours' && (
            <HoursSection schedule={schedule} setSchedule={setSchedule} />
          )}
          {active === 'rules' && (
            <RulesSection
              minDur={minDur}
              setMinDur={setMinDur}
              maxDur={maxDur}
              setMaxDur={setMaxDur}
              step={step}
              setStep={setStep}
              advanceDays={advanceDays}
              setAdvanceDays={setAdvanceDays}
              cancelHours={cancelHours}
              setCancelHours={setCancelHours}
              deposit={deposit}
              setDeposit={setDeposit}
              depositPct={depositPct}
              setDepositPct={setDepositPct}
              autoCancel={autoCancel}
              setAutoCancel={setAutoCancel}
              checkin={checkin}
              setCheckin={setCheckin}
              recurring={recurring}
              setRecurring={setRecurring}
            />
          )}
          {active === 'pricing' && (
            <PricingSection rules={pricingRules} setRules={setPricingRules} />
          )}
          {active === 'availability' && (
            <AvailabilitySection blocked={blockedDays} setBlocked={setBlockedDays} />
          )}
          {active === 'maintenance' && <MaintenanceSection />}
          {active === 'display' && (
            <DisplaySection display={display} setDisplay={setDisplay} />
          )}
          {active === 'advanced' && (
            <AdvancedSection advanced={advanced} setAdvanced={setAdvanced} />
          )}
        </main>

        {/* Right preview */}
        <aside className="hidden xl:block col-span-3">
          <div className="sticky top-24 space-y-4">
            <PreviewPanel
              name={display.customName || name}
              sport={sport}
              status={status}
              features={[...env, ...surface, ...quality]}
              schedule={schedule}
              pricing={pricingRules}
            />
          </div>
        </aside>
      </div>

      {/* Sticky mobile action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border p-3 flex items-center gap-2">
        <Btn variant="outline" className="flex-1">
          <RotateCcw className="h-4 w-4" /> Đặt lại
        </Btn>
        <Btn className="flex-1" onClick={handleSave}>
          <Save className="h-4 w-4" /> Lưu
        </Btn>
      </div>
    </div>
  )
}

/* ───────────────────────── Sections ───────────────────────── */

function BasicSection(props: any) {
  const {
    name,
    setName,
    branch,
    setBranch,
    sport,
    setSport,
    code,
    setCode,
    desc,
    setDesc,
    status,
    setStatus,
  } = props
  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={Info}
        accent="orange"
        title="Thông tin cơ bản"
        desc="Các thông tin chung của sân hiển thị cho khách hàng."
      />
      <div className="grid md:grid-cols-2 gap-5">
        <Field
          label="Tên sân"
          required
          hint="Tên sẽ hiển thị trên trang đặt sân của khách hàng."
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Mã sân" required>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VD: BD-A1"
          />
        </Field>
        <Field label="Chi nhánh" required>
          <Select
            value={branch}
            onChange={setBranch}
            options={[
              { value: 'ch-saigon-arena', label: 'Saigon Sports Arena — Q. Phú Nhuận' },
              { value: 'ch-thao-dien', label: 'Thảo Điền Sports Center' },
              { value: 'ch-q7', label: 'Phú Mỹ Hưng Athletic Club — Q. 7' },
            ]}
          />
        </Field>
        <Field label="Loại môn thể thao" required>
          <Select
            value={sport}
            onChange={setSport}
            options={[
              { value: 'badminton', label: '🏸 Cầu lông' },
              { value: 'football', label: '⚽ Bóng đá' },
              { value: 'tennis', label: '🎾 Tennis' },
              { value: 'basketball', label: '🏀 Bóng rổ' },
              { value: 'pickleball', label: '🥒 Pickleball' },
            ]}
          />
        </Field>
        <Field
          label="Mô tả sân"
          hint="Mô tả ngắn gọn về sân, chất lượng và đặc điểm nổi bật."
        >
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <Field label="Trạng thái sân">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'active', l: 'Hoạt động', tone: 'green' },
              { v: 'paused', l: 'Tạm dừng', tone: 'amber' },
              { v: 'closed', l: 'Đóng cửa', tone: 'slate' },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => setStatus(s.v)}
                className={cls(
                  'h-10 rounded-xl border text-sm font-medium transition',
                  status === s.v
                    ? 'border-primary bg-primary/8 text-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                {s.l}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6">
        <Field
          label="Hình ảnh sân"
          hint="Thêm tối thiểu 3 ảnh chất lượng cao. Định dạng JPG/PNG, tối đa 5MB."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group"
              >
                <img src={branchImg} alt="" className="h-full w-full object-cover" />
                <button className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-background/90 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
                {i === 1 && (
                  <div className="absolute top-2 left-2">
                    <Badge tone="orange">
                      <Star className="h-2.5 w-2.5" /> Ảnh chính
                    </Badge>
                  </div>
                )}
              </div>
            ))}
            <button className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition grid place-items-center text-center text-muted-foreground hover:text-primary">
              <div>
                <ImagePlus className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Thêm ảnh</div>
              </div>
            </button>
          </div>
        </Field>
      </div>
    </Card>
  )
}

const envOpts = [
  { id: 'indoor', icon: HomeIcon, label: 'Trong nhà' },
  { id: 'outdoor', icon: Sun, label: 'Ngoài trời' },
  { id: 'covered', icon: Wind, label: 'Có mái che' },
  { id: 'air', icon: Snowflake, label: 'Điều hòa' },
]
const surfaceOpts = [
  { id: 'wood', icon: Square, label: 'Sàn gỗ' },
  { id: 'synthetic', icon: Square, label: 'Sàn tổng hợp' },
  { id: 'concrete', icon: Square, label: 'Bê tông' },
  { id: 'grass', icon: Trees, label: 'Cỏ nhân tạo' },
]
const qualityOpts = [
  { id: 'vip', icon: Crown, label: 'VIP' },
  { id: 'training', icon: GraduationCap, label: 'Tập luyện' },
  { id: 'competition', icon: Trophy, label: 'Thi đấu' },
  { id: 'child', icon: Baby, label: 'Thân thiện trẻ em' },
  { id: 'private', icon: Lock, label: 'Riêng tư' },
]

function FeaturesSection({ env, setEnv, surface, setSurface, quality, setQuality }: any) {
  const toggle = (arr: string[], setArr: any, id: string) =>
    setArr(arr.includes(id) ? arr.filter((x: string) => x !== id) : [...arr, id])

  const Group = ({ title, opts, sel, setSel }: any) => (
    <div>
      <div className="text-sm font-semibold text-foreground mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map((o: any) => (
          <Chip
            key={o.id}
            active={sel.includes(o.id)}
            onClick={() => toggle(sel, setSel, o.id)}
            icon={o.icon}
            label={o.label}
          />
        ))}
      </div>
    </div>
  )

  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={Sparkles}
        accent="orange"
        title="Tiện ích sân"
        desc="Chọn các tính chất mô tả sân — hiển thị dưới dạng huy hiệu cho khách."
      />
      <div className="space-y-6">
        <Group title="Môi trường" opts={envOpts} sel={env} setSel={setEnv} />
        <Group title="Bề mặt sân" opts={surfaceOpts} sel={surface} setSel={setSurface} />
        <Group
          title="Tính chất sân"
          opts={qualityOpts}
          sel={quality}
          setSel={setQuality}
        />
      </div>
      <button className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition">
        <Plus className="h-4 w-4" /> Thêm tiện ích tùy chỉnh
      </button>
    </Card>
  )
}

function HoursSection({ schedule, setSchedule }: any) {
  const update = (i: number, patch: any) => {
    const next = [...schedule]
    next[i] = { ...next[i], ...patch }
    setSchedule(next)
  }
  const copyToAll = (i: number) => {
    const src = schedule[i]
    setSchedule(
      schedule.map((d: any) => ({
        ...d,
        open: src.open,
        start: src.start,
        end: src.end,
        hasBreak: src.hasBreak,
        breakStart: src.breakStart,
        breakEnd: src.breakEnd,
      })),
    )
  }
  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={Clock}
        accent="blue"
        title="Giờ hoạt động"
        desc="Cấu hình giờ mở cửa từng ngày trong tuần. Có thể sao chép sang các ngày khác."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {schedule.map((d: any, i: number) => (
          <div
            key={d.day}
            className={cls(
              'rounded-2xl border p-4 transition',
              d.open ? 'border-border bg-card' : 'border-border bg-muted/40 opacity-80',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">{d.day}</div>
                <div className="text-xs text-muted-foreground">
                  {d.open ? `${d.start} → ${d.end}` : 'Đóng cửa'}
                </div>
              </div>
              <Toggle checked={d.open} onChange={(b) => update(i, { open: b })} />
            </div>
            {d.open && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-1">Mở cửa</div>
                    <Input
                      type="time"
                      value={d.start}
                      onChange={(e) => update(i, { start: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-1">Đóng cửa</div>
                    <Input
                      type="time"
                      value={d.end}
                      onChange={(e) => update(i, { end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => update(i, { hasBreak: !d.hasBreak })}
                    className={cls(
                      'text-xs h-8 px-2.5 rounded-lg border transition',
                      d.hasBreak
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {d.hasBreak ? '✓ Nghỉ giữa giờ' : '+ Nghỉ giữa giờ'}
                  </button>
                  <button
                    onClick={() => copyToAll(i)}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs h-8 px-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" /> Sao chép lịch
                  </button>
                </div>
                {d.hasBreak && (
                  <div className="mt-2 grid grid-cols-2 gap-2 animate-[fade-in_0.2s]">
                    <Input
                      type="time"
                      value={d.breakStart}
                      onChange={(e) => update(i, { breakStart: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={d.breakEnd}
                      onChange={(e) => update(i, { breakEnd: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function RulesSection(p: any) {
  return (
    <div className="space-y-5 animate-[fade-up_0.4s_ease-out]">
      <Card className="p-6 md:p-8">
        <SectionHeader
          icon={ShieldCheck}
          accent="blue"
          title="Quy tắc đặt sân"
          desc="Quy định cách khách hàng có thể đặt và hủy sân."
        />
        <div className="grid md:grid-cols-2 gap-6">
          <Field
            label="Thời lượng đặt tối thiểu"
            hint="Khách phải đặt ít nhất N phút mỗi lượt."
          >
            <Slider
              value={p.minDur}
              onChange={p.setMinDur}
              min={30}
              max={180}
              step={15}
              suffix=" phút"
            />
          </Field>
          <Field label="Thời lượng đặt tối đa">
            <Slider
              value={p.maxDur}
              onChange={p.setMaxDur}
              min={60}
              max={360}
              step={30}
              suffix=" phút"
            />
          </Field>
          <Field
            label="Bước thời gian đặt sân"
            hint="Khoảng thời gian giữa các khung giờ có thể đặt."
          >
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 60, 90].map((v) => (
                <button
                  key={v}
                  onClick={() => p.setStep(v)}
                  className={cls(
                    'h-10 rounded-xl border text-sm font-medium transition',
                    p.step === v
                      ? 'border-primary bg-primary/8 text-primary'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  {v}p
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cho phép đặt trước (ngày)">
            <Slider
              value={p.advanceDays}
              onChange={p.setAdvanceDays}
              min={1}
              max={60}
              suffix=" ngày"
            />
          </Field>
          <Field
            label="Thời hạn hủy sân"
            hint="Hủy trước thời điểm đặt ít nhất N giờ để được hoàn tiền."
          >
            <Slider
              value={p.cancelHours}
              onChange={p.setCancelHours}
              min={1}
              max={48}
              suffix=" giờ"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          <div className="space-y-5">
            <Toggle
              checked={p.deposit}
              onChange={p.setDeposit}
              label="Yêu cầu đặt cọc"
              desc="Khách thanh toán một phần khi đặt sân."
            />
            {p.deposit && (
              <div className="pl-1 animate-[fade-in_0.2s]">
                <Field label={`Phần trăm đặt cọc — ${p.depositPct}%`}>
                  <Slider
                    value={p.depositPct}
                    onChange={p.setDepositPct}
                    min={10}
                    max={100}
                    step={5}
                    suffix="%"
                  />
                </Field>
              </div>
            )}
            <Toggle
              checked={p.autoCancel}
              onChange={p.setAutoCancel}
              label="Tự động hủy nếu chưa thanh toán"
              desc="Hệ thống tự hủy sau 15 phút nếu không thanh toán."
            />
          </div>
          <div className="space-y-5">
            <Toggle
              checked={p.checkin}
              onChange={p.setCheckin}
              label="Yêu cầu check-in"
              desc="Khách phải check-in tại quầy lễ tân khi đến."
            />
            <Toggle
              checked={p.recurring}
              onChange={p.setRecurring}
              label="Cho phép đặt lịch lặp lại"
              desc="Khách có thể đặt sân định kỳ hàng tuần."
            />

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                Cảnh báo: thời lượng tối thiểu ({p.minDur}p) lớn hơn bước thời gian (
                {p.step}p). Kiểm tra lại để tránh xung đột.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PricingSection({ rules, setRules }: any) {
  const dayOpts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  const remove = (id: number) => setRules(rules.filter((r: any) => r.id !== id))
  const add = () =>
    setRules([
      ...rules,
      {
        id: Date.now(),
        label: 'Quy tắc mới',
        from: '08:00',
        to: '10:00',
        price: 150000,
        peak: false,
        days: ['T2'],
        priority: 3,
      },
    ])

  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <SectionHeader
          icon={Wallet}
          accent="orange"
          title="Cấu hình giá"
          desc="Quản lý các khung giá theo giờ, ngày và mức độ ưu tiên."
        />
      </div>

      {/* Timeline visualization */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-transparent p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Khung giờ áp dụng — Thứ 2 đến Thứ 6</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-[oklch(0.7_0.12_240)]" /> Thấp điểm
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-primary" /> Cao điểm
            </span>
          </div>
        </div>
        <div className="relative h-14 rounded-xl bg-card border border-border overflow-hidden">
          {rules
            .filter((r: any) => !r.days.includes('T7') && !r.days.includes('CN'))
            .map((r: any) => {
              const from = toHour(r.from),
                to = toHour(r.to)
              const left = (from / 24) * 100,
                width = ((to - from) / 24) * 100
              return (
                <div
                  key={r.id}
                  className={cls(
                    'absolute top-0 bottom-0 grid place-items-center text-[11px] font-semibold text-white',
                    r.peak
                      ? 'bg-gradient-to-r from-primary to-primary-glow'
                      : 'bg-[oklch(0.7_0.12_240)]',
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {fmtVND(r.price)}
                </div>
              )
            })}
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground tabular-nums">
          {[0, 4, 8, 12, 16, 20, 24].map((h) => (
            <span key={h}>{h.toString().padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((r: any) => (
          <div
            key={r.id}
            className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition group"
          >
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground/50 mt-2 cursor-grab" />
              <div className="flex-1 grid md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Tên quy tắc
                  </div>
                  <Input
                    value={r.label}
                    onChange={(e) =>
                      setRules(
                        rules.map((x: any) =>
                          x.id === r.id ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Khung giờ
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="time"
                      value={r.from}
                      onChange={(e) =>
                        setRules(
                          rules.map((x: any) =>
                            x.id === r.id ? { ...x, from: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <span className="text-muted-foreground">→</span>
                    <Input
                      type="time"
                      value={r.to}
                      onChange={(e) =>
                        setRules(
                          rules.map((x: any) =>
                            x.id === r.id ? { ...x, to: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Giá cơ bản
                  </div>
                  <Input value={fmtVND(r.price)} readOnly />
                </div>
                <div className="md:col-span-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Áp dụng cho ngày
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dayOpts.map((d) => {
                      const on = r.days.includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() =>
                            setRules(
                              rules.map((x: any) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      days: on
                                        ? x.days.filter((y: string) => y !== d)
                                        : [...x.days, d],
                                    }
                                  : x,
                              ),
                            )
                          }
                          className={cls(
                            'h-8 w-8 rounded-lg text-[11px] font-semibold transition',
                            on
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80',
                          )}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="md:col-span-1 flex md:flex-col gap-2 items-center md:items-end">
                  {r.peak && <Badge tone="orange">Giờ cao điểm</Badge>}
                  <Badge tone="slate">Ưu tiên {r.priority}</Badge>
                </div>
              </div>
              <button
                onClick={() => remove(r.id)}
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground grid place-items-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <div className="text-sm font-semibold mb-1">Chưa có quy tắc giá nào</div>
            <div className="text-xs text-muted-foreground mb-4">
              Thêm quy tắc đầu tiên để bắt đầu cấu hình giá theo khung giờ.
            </div>
          </div>
        )}

        <button
          onClick={add}
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition"
        >
          <Plus className="h-4 w-4" /> Thêm quy tắc giá
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5">
        <div className="rounded-2xl border border-border p-4 bg-gradient-to-br from-[oklch(0.95_0.04_240)] to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Giá cuối tuần</div>
              <div className="text-xl font-bold mt-0.5">
                {fmtVND(250000)}
                <span className="text-xs font-normal text-muted-foreground">/giờ</span>
              </div>
            </div>
            <Badge tone="blue">+25%</Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-border p-4 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Giá ngày lễ</div>
              <div className="text-xl font-bold mt-0.5">
                {fmtVND(320000)}
                <span className="text-xs font-normal text-muted-foreground">/giờ</span>
              </div>
            </div>
            <Badge tone="orange">+60%</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}

function toHour(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

function AvailabilitySection({ blocked, setBlocked }: any) {
  const daysInMonth = 30
  const toggle = (d: number) =>
    setBlocked(
      blocked.includes(d) ? blocked.filter((x: number) => x !== d) : [...blocked, d],
    )
  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={CalendarDays}
        accent="blue"
        title="Lịch khả dụng"
        desc="Đánh dấu các ngày không khả dụng và khóa khung giờ cụ thể."
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Btn variant="outline">
          <Lock className="h-4 w-4" /> Khóa hôm nay
        </Btn>
        <Btn variant="outline">Khóa cuối tuần</Btn>
        <Btn variant="outline">Khóa ngày lễ</Btn>
        <Btn variant="ghost" onClick={() => setBlocked([])}>
          <X className="h-4 w-4" /> Xóa tất cả
        </Btn>
      </div>

      <div className="rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Tháng 11, 2026</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-muted" /> Khả dụng
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-destructive/70" /> Khóa
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-primary" /> Hôm nay
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-[11px] font-medium text-muted-foreground mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1
            const isBlocked = blocked.includes(d)
            const isToday = d === 17
            return (
              <button
                key={d}
                onClick={() => toggle(d)}
                className={cls(
                  'aspect-square rounded-lg text-sm font-medium transition border',
                  isBlocked
                    ? 'bg-destructive/15 text-destructive border-destructive/30 line-through'
                    : isToday
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary hover:bg-primary/5',
                )}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-5">
        <div className="rounded-2xl border border-border p-4">
          <div className="text-sm font-semibold mb-2">Khóa khung giờ cụ thể</div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="time" defaultValue="12:00" />
            <Input type="time" defaultValue="14:00" />
          </div>
          <div className="mt-3">
            <Toggle checked={true} onChange={() => {}} label="Lặp lại hàng tuần" />
          </div>
        </div>
        <div className="rounded-2xl border border-border p-4 bg-muted/30">
          <div className="text-sm font-semibold mb-2">Tóm tắt</div>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• {blocked.length} ngày bị khóa trong tháng này</li>
            <li>• 2 khung giờ lặp lại hàng tuần</li>
            <li>• Tổng giờ khả dụng: 412 giờ</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

function MaintenanceSection() {
  const [active, setActive] = useState(false)
  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={Wrench}
        accent="orange"
        title="Cấu hình bảo trì"
        desc="Lập lịch bảo trì và thông báo khách hàng tự động."
      />

      <div
        className={cls(
          'rounded-2xl p-4 mb-5 flex items-center justify-between border',
          active ? 'border-amber-200 bg-amber-50' : 'border-border bg-muted/30',
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cls(
              'h-10 w-10 rounded-xl grid place-items-center',
              active ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground',
            )}
          >
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Trạng thái bảo trì</div>
            <div className="text-xs text-muted-foreground">
              {active
                ? 'Sân đang trong chế độ bảo trì'
                : 'Sân đang hoạt động bình thường'}
            </div>
          </div>
        </div>
        <Toggle checked={active} onChange={setActive} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Lý do bảo trì">
          <Select
            value="surface"
            onChange={() => {}}
            options={[
              { value: 'surface', label: 'Sửa chữa mặt sân' },
              { value: 'light', label: 'Thay hệ thống đèn' },
              { value: 'net', label: 'Thay lưới / cột' },
              { value: 'general', label: 'Bảo trì tổng quát' },
            ]}
          />
        </Field>
        <Field label="Khung giờ bị ảnh hưởng">
          <Input defaultValue="08:00 - 16:00" />
        </Field>
        <Field label="Thời gian bắt đầu">
          <Input type="datetime-local" defaultValue="2026-05-20T08:00" />
        </Field>
        <Field label="Thời gian kết thúc">
          <Input type="datetime-local" defaultValue="2026-05-22T16:00" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Ghi chú nội bộ">
            <Textarea defaultValue="Thay mặt sàn PVC mới, đèn LED khu vực B. Liên hệ kỹ thuật: 0901 234 567." />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Toggle
            checked={true}
            onChange={() => {}}
            label="Thông báo cho khách hàng"
            desc="Tự động gửi email và push notification tới các khách đã đặt trong thời gian bảo trì."
          />
        </div>
      </div>
    </Card>
  )
}

function DisplaySection({ display, setDisplay }: any) {
  const set = (k: string, v: any) => setDisplay({ ...display, [k]: v })
  return (
    <Card className="p-6 md:p-8 animate-[fade-up_0.4s_ease-out]">
      <SectionHeader
        icon={Eye}
        accent="blue"
        title="Hiển thị"
        desc="Cách sân xuất hiện trên trang khách hàng."
      />
      <div className="grid md:grid-cols-2 gap-5">
        <Field
          label="Tên hiển thị"
          hint="Tên thay thế dùng cho khách (nếu để trống sẽ dùng tên sân)."
        >
          <Input
            value={display.customName}
            onChange={(e) => set('customName', e.target.value)}
          />
        </Field>
        <Field label="Thứ tự hiển thị" hint="Số nhỏ hơn sẽ hiển thị trước.">
          <Input
            type="number"
            value={display.order}
            onChange={(e) => set('order', Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {[
          ['public', 'Hiển thị trên trang khách hàng'],
          ['highlight', 'Làm nổi bật sân'],
          ['showPrice', 'Hiển thị giá'],
          ['showSlots', 'Hiển thị khung giờ trống'],
          ['showReviews', 'Hiển thị đánh giá'],
          ['featured', 'Nhãn nổi bật (Featured)'],
        ].map(([k, l]) => (
          <div key={k} className="rounded-xl border border-border p-3">
            <Toggle checked={display[k]} onChange={(b) => set(k, b)} label={l} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function AdvancedSection({ advanced, setAdvanced }: any) {
  const set = (k: string, v: any) => setAdvanced({ ...advanced, [k]: v })
  const items = [
    {
      k: 'memberPricing',
      title: 'Giá theo hạng thành viên',
      desc: 'Áp dụng giảm giá khác nhau cho Silver / Gold / VIP.',
    },
    {
      k: 'staffApproval',
      title: 'Yêu cầu nhân viên duyệt',
      desc: 'Mỗi lượt đặt phải được nhân viên xác nhận thủ công.',
    },
    {
      k: 'autoAssign',
      title: 'Tự động phân công nhân viên',
      desc: 'Hệ thống tự gán nhân viên trực sân dựa trên ca làm.',
    },
  ]

  return (
    <div className="space-y-4 animate-[fade-up_0.4s_ease-out]">
      <Card className="p-6 md:p-8">
        <SectionHeader
          icon={Settings2}
          accent="slate"
          title="Cấu hình nâng cao"
          desc="Dành cho quản trị viên có kinh nghiệm."
        />
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.k} className="rounded-xl border border-border p-4">
              <Toggle
                checked={advanced[it.k]}
                onChange={(b) => set(it.k, b)}
                label={it.title}
                desc={it.desc}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:p-8 space-y-6">
        <Field
          label="Giới hạn lượt đặt mỗi ngày / khách"
          hint="Một khách hàng chỉ được đặt tối đa N lượt mỗi ngày."
        >
          <Slider
            value={advanced.dailyLimit}
            onChange={(v) => set('dailyLimit', v)}
            min={1}
            max={10}
            suffix=" lượt"
          />
        </Field>
        <Field
          label="Thời gian đệm giữa các lượt đặt"
          hint="Khoảng trống giữa hai lượt đặt liên tiếp để dọn dẹp."
        >
          <Slider
            value={advanced.buffer}
            onChange={(v) => set('buffer', v)}
            min={0}
            max={60}
            step={5}
            suffix=" phút"
          />
        </Field>
      </Card>
    </div>
  )
}

/* ───────────────────────── Preview ───────────────────────── */

function PreviewPanel({ name, sport, status, features, schedule, pricing }: any) {
  const today = schedule[1] || schedule[0]
  const prices = pricing.map((p: any) => p.price)
  const min = Math.min(...prices),
    max = Math.max(...prices)

  const statusTone =
    status === 'active' ? 'green' : status === 'paused' ? 'amber' : 'slate'
  const statusLabel =
    status === 'active' ? 'Đang hoạt động' : status === 'paused' ? 'Tạm dừng' : 'Đóng cửa'

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Xem trước
          </div>
          <div className="text-sm font-semibold">Thông tin khách hàng sẽ thấy</div>
        </div>
        <Badge tone="orange">Live</Badge>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3]">
          <img
            src={branchImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge tone={statusTone as any}>{statusLabel}</Badge>
            <span className="inline-flex items-center gap-1 h-7 px-2 rounded-lg bg-white/95 text-foreground text-xs font-semibold">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="font-display font-bold text-lg leading-tight">{name}</div>
            <div className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> Saigon Sports Arena
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Khung giờ hôm nay</span>
            <span className="font-semibold">
              {today.open ? `${today.start} – ${today.end}` : 'Đóng cửa'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Khoảng giá hiện tại</span>
            <span className="font-semibold text-primary">
              {fmtVND(min)} – {fmtVND(max)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
            {features.slice(0, 5).map((f: string) => (
              <span
                key={f}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
              >
                {labelOf(f)}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-semibold mb-2">Khung giờ trống hôm nay</div>
        <div className="grid grid-cols-4 gap-1.5">
          {['07:00', '09:00', '10:00', '13:00', '15:00', '17:00', '19:00', '21:00'].map(
            (t, i) => (
              <div
                key={t}
                className={cls(
                  'text-[11px] h-7 rounded-md grid place-items-center font-semibold',
                  i % 3 === 0
                    ? 'bg-muted text-muted-foreground line-through'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {t}
              </div>
            ),
          )}
        </div>
      </Card>
    </>
  )
}

function labelOf(id: string) {
  const all: Record<string, string> = {
    indoor: 'Trong nhà',
    outdoor: 'Ngoài trời',
    covered: 'Có mái che',
    air: 'Điều hòa',
    wood: 'Sàn gỗ',
    synthetic: 'Sàn tổng hợp',
    concrete: 'Bê tông',
    grass: 'Cỏ nhân tạo',
    vip: 'VIP',
    training: 'Tập luyện',
    competition: 'Thi đấu',
    child: 'Trẻ em',
    private: 'Riêng tư',
  }
  return all[id] || id
}
