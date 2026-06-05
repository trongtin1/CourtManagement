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
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* ───── Inline styles for animations ───── */}
      <style>{`
        @keyframes login-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes login-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes login-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-float { animation: login-float 6s ease-in-out infinite; }
        .login-gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa);
          background-size: 200% 200%;
          animation: login-gradient 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-fade-up {
          animation: login-fade-up 0.6s ease-out both;
        }
        .login-fade-up-delay-1 { animation-delay: 0.1s; }
        .login-fade-up-delay-2 { animation-delay: 0.2s; }
        .login-fade-up-delay-3 { animation-delay: 0.35s; }
      `}</style>

      {/* ───── Left: Hero Image Panel ───── */}
      <div className="relative hidden w-[55%] lg:block">
        <img
          src={courtHero}
          alt="Court"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/90 via-slate-900/70 to-blue-950/60" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Content on hero */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 login-fade-up">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <svg
                className="h-5 w-5 text-white"
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
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Court Management
            </span>
          </div>

          {/* Hero text */}
          <div className="max-w-lg login-fade-up login-fade-up-delay-1">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Quản lý sân
              <br />
              <span className="login-gradient-text">thể thao thông minh</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70 max-w-md">
              Nền tảng quản lý đặt sân, lịch trình, thanh toán và thành viên một cách dễ
              dàng và chuyên nghiệp.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: '📅', label: 'Đặt sân nhanh' },
                { icon: '👥', label: 'Quản lý thành viên' },
                { icon: '💳', label: 'Thanh toán an toàn' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/90 backdrop-blur-sm"
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-white/40 login-fade-up login-fade-up-delay-2">
            © {new Date().getFullYear()} Court Management System
          </div>
        </div>
      </div>

      {/* ───── Right: Login Form Panel ───── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm login-fade-up login-fade-up-delay-2">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <svg
                className="h-4.5 w-4.5 text-white"
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
            </div>
            <span className="text-base font-bold text-slate-900">Court Management</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Đăng nhập
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Nhập thông tin tài khoản để truy cập hệ thống
            </p>
          </div>

          {/* Form */}
          <Form<LoginRequest>
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-700">
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
              className="mb-5"
            >
              <Input
                autoComplete="username"
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="admin@example.com"
                className="rounded-xl"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-slate-700">Mật khẩu</span>
              }
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              className="mb-6"
            >
              <Input.Password
                autoComplete="current-password"
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="••••••••"
                className="rounded-xl"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Button
              block
              htmlType="submit"
              loading={loginMutation.isPending}
              type="primary"
              className="rounded-xl border-0 font-bold shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.99]"
              style={{
                height: 46,
                fontSize: 15,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              }}
            >
              Đăng nhập
            </Button>
          </Form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400 select-none">COURT MANAGEMENT</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-4 text-center text-xs text-slate-400 leading-relaxed">
            Hệ thống quản lý sân thể thao chuyên nghiệp.
            <br />
            Liên hệ quản trị viên nếu bạn cần hỗ trợ.
          </p>
        </div>
      </div>
    </main>
  )
}
