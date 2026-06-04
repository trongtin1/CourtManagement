import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { App, Button, Form, Input } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import courtHero from '@/assets/court_login_hero.png'
import { ROUTES } from '@/constants/routes'
import { useLoginMutation } from '@/features/auth/api/useAuthQueries'
import { setCredentials } from '@/features/auth/model/authSlice'
import type { LoginRequest } from '@/features/auth/model/types'
import { useAppDispatch } from '@/hooks/redux'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { storage } from '@/utils/storage'

type LocationState = {
  from?: {
    pathname?: string
  }
}

const CourtIcon = ({ className = 'h-7 w-7' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
)

const FeatureItem = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-md">
      {icon}
    </div>
    <div>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="text-xs text-white/75">{desc}</div>
    </div>
  </div>
)

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const loginMutation = useLoginMutation()

  const from =
    (location.state as LocationState | null)?.from?.pathname || ROUTES.dashboard

  const handleSubmit = async (values: LoginRequest) => {
    const credentials = await loginMutation.mutateAsync(values)

    dispatch(setCredentials(credentials))

    const isSuperAdmin = credentials.user.roles.some((role) =>
      ['SuperAdmin', 'Administrator'].includes(role),
    )

    if (isSuperAdmin) {
      storage.remove(AUTH_STORAGE_KEYS.workingFacilityId)
      storage.remove(AUTH_STORAGE_KEYS.workingFacility)
      message.success('Signed in successfully')
      navigate(ROUTES.selectFacility, { replace: true })
      return
    }

    if (credentials.user.facilityID) {
      storage.set(
        AUTH_STORAGE_KEYS.workingFacilityId,
        String(credentials.user.facilityID),
      )
    }

    message.success('Signed in successfully')
    navigate(from, { replace: true })
  }

  return (
    <main
      className="relative min-h-screen bg-slate-950 font-sans lg:h-screen lg:overflow-hidden"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${courtHero})` }}
      />

        <div className="absolute inset-0 bg-linear-to-r from-slate-950/82 via-slate-900/45 to-white/15" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/35 via-transparent to-transparent" />

        <section className="relative z-10 grid min-h-screen lg:min-h-0 lg:h-full grid-cols-1 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-16 lg:py-10">
          <div className="flex flex-col justify-between lg:h-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md">
                <CourtIcon className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-white">Court Management</span>
            </div>

            <div className="max-w-2xl py-8 lg:py-0">
              <h1 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
                Quản lý sân thể thao
                <br />
                đơn giản và hiệu quả
              </h1>

              <div className="mb-6 h-1 w-12 rounded-full bg-blue-500" />

              <p className="mb-8 max-w-xl text-base leading-7 text-white/90">
                Nền tảng giúp bạn quản lý đặt sân, lịch trình, thanh toán và thành viên
                một cách dễ dàng.
              </p>

              <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                <FeatureItem
                  icon={
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="17" rx="2" />
                      <path d="M8 2v4M16 2v4M3 10h18" />
                    </svg>
                  }
                  title="Đặt sân"
                  desc="Nhanh chóng"
                />

                <FeatureItem
                  icon={
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                  title="Thành viên"
                  desc="Dễ dàng quản lý"
                />

                <FeatureItem
                  icon={
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 15h4" />
                    </svg>
                  }
                  title="Thanh toán"
                  desc="An toàn, minh bạch"
                />
              </div>
            </div>

            <div className="hidden text-xs text-white/50 lg:block">
              © {new Date().getFullYear()} Court Management
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end lg:pr-12 lg:h-full">
            <div className="w-full max-w-110 rounded-3xl border border-white/60 bg-white/88 p-6 backdrop-blur-2xl sm:p-8">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.12)] ring-1 ring-slate-200">
                  <CourtIcon className="h-7 w-7" />
                </div>

                <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  Chào mừng trở lại!
                </h2>

                <p className="text-xs text-slate-500">
                  Đăng nhập để tiếp tục sử dụng hệ thống
                </p>
              </div>

              <Form<LoginRequest>
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                size="large"
              >
                <Form.Item
                  label={
                    <span className="text-xs font-bold text-slate-800">
                      Email hoặc tên đăng nhập
                    </span>
                  }
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập email hoặc tên đăng nhập',
                    },
                  ]}
                  className="mb-4"
                >
                  <Input
                    autoComplete="username"
                    prefix={<MailOutlined className="mr-2 text-slate-400" />}
                    placeholder="Nhập email hoặc tên đăng nhập"
                    className="rounded-xl text-sm"
                    style={{
                      height: 44,
                      borderColor: '#dbe3ef',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-bold text-slate-800">Mật khẩu</span>
                  }
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                  className="mb-4"
                >
                  <Input.Password
                    autoComplete="current-password"
                    prefix={<LockOutlined className="mr-2 text-slate-400" />}
                    placeholder="Nhập mật khẩu"
                    className="rounded-xl text-sm"
                    style={{
                      height: 44,
                      borderColor: '#dbe3ef',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </Form.Item>

                <Button
                  block
                  htmlType="submit"
                  loading={loginMutation.isPending}
                  type="primary"
                  className="h-11 rounded-xl border-0 bg-blue-600 text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99]"
                  style={{
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#2563eb',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                    fontWeight: 700,
                  }}
                >
                  Đăng nhập
                </Button>
              </Form>
            </div>
          </div>
        </section>
      </main>
  )
}
