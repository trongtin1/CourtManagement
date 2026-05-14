import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import { Link, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

const breadcrumbLabels: Record<string, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.areas]: 'Khu vực',
}

export function PageBreadcrumb() {
  const location = useLocation()

  if (location.pathname === ROUTES.root) {
    return null
  }

  const currentLabel = breadcrumbLabels[location.pathname] || 'Page'

  return (
    <Breadcrumb
      className="mb-4"
      items={[
        {
          title: (
            <Link to={ROUTES.dashboard}>
              <HomeOutlined />
            </Link>
          ),
        },
        {
          title: currentLabel,
        },
      ]}
    />
  )
}
