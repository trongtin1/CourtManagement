import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

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
    <main className="grid min-h-screen place-items-center bg-slate-50 p-5 md:p-8">
      <section className="grid w-full max-w-260 grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_420px] md:gap-12">
        <div>
          <Typography.Title
            className="mb-4! text-4xl! text-slate-900! md:text-5xl!"
            level={1}
          >
            Court Management
          </Typography.Title>
          <Typography.Paragraph className="max-w-xl text-lg! text-slate-600!">
            Centralized workspace for court operations, schedules, cases, and user
            administration.
          </Typography.Paragraph>
        </div>

        <Card className="rounded-lg shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <Typography.Title className="mb-1!" level={2}>
            Sign in
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Sign in with your court management account.
          </Typography.Paragraph>

          <Form<LoginRequest>
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              label="Login"
              name="email"
              rules={[{ required: true, message: 'Login is required' }]}
            >
              <Input autoComplete="username" prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password autoComplete="current-password" prefix={<LockOutlined />} />
            </Form.Item>

            <Button
              block
              htmlType="submit"
              loading={loginMutation.isPending}
              type="primary"
            >
              Sign in
            </Button>
          </Form>
        </Card>
      </section>
    </main>
  )
}
