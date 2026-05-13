import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Result
      extra={
        <Button onClick={() => navigate(ROUTES.dashboard)} type="primary">
          Back to dashboard
        </Button>
      }
      status="404"
      subTitle="The page you requested does not exist."
      title="Page not found"
    />
  )
}
