import { useEffect } from 'react'
import { Button, Empty, Skeleton, Space, Typography } from 'antd'
import {
  AppstoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { ROUTES } from '@/constants/routes'
import { selectCurrentUser } from '@/features/auth/model/authSlice'
import { useFacilitiesQuery } from '@/features/facilities/api/useFacilityQueries'
import type { Facility } from '@/features/facilities/model/types'
import { useAppSelector } from '@/hooks/redux'
import { storage } from '@/utils/storage'

const isSuperAdminRole = (roles?: string[]) =>
  roles?.some((role) => ['SuperAdmin', 'Administrator'].includes(role)) ?? false

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FC'

export function SelectFacilityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAppSelector(selectCurrentUser)
  const facilitiesQuery = useFacilitiesQuery({ page: 1, pageSize: 100 })
  const isSuperAdmin = isSuperAdminRole(user?.roles)

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [isSuperAdmin, navigate])

  const openWorkspace = (facilityId: string) => {
    storage.set(AUTH_STORAGE_KEYS.workingFacilityId, facilityId)
    queryClient.invalidateQueries()
    navigate(ROUTES.dashboard, { replace: true })
  }

  const openCreateFacility = () => {
    storage.set(AUTH_STORAGE_KEYS.workingFacilityId, 'all')
    queryClient.invalidateQueries()
    navigate(ROUTES.facilities, { replace: true })
  }

  const renderFacilityProfile = (facility: Facility) => (
    <button
      className="group flex w-36 flex-col items-center gap-3 border-0 bg-transparent p-0 text-center outline-none md:w-44"
      key={facility.facilityID}
      onClick={() => openWorkspace(String(facility.facilityID))}
      type="button"
    >
      <span className="grid aspect-square w-full place-items-center rounded-md border-2 border-transparent bg-slate-800 text-4xl font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition group-hover:border-white group-hover:bg-blue-600 md:text-5xl">
        {getInitials(facility.facilityName)}
      </span>
      <span className="line-clamp-2 min-h-11 text-base font-medium text-slate-300 transition group-hover:text-white">
        {facility.facilityName}
      </span>
      <span className="flex items-center gap-1 text-xs text-slate-500">
        <ShopOutlined />
        {facility.isActive ? 'Đang hoạt động' : 'Tạm tắt'}
      </span>
    </button>
  )

  if (!isSuperAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#111827] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col">
        <div className="flex items-center justify-between">
          <Typography.Title className="mb-0! text-white!" level={3}>
            Court Admin
          </Typography.Title>
          <Space>
            <Button
              ghost
              icon={<ReloadOutlined />}
              loading={facilitiesQuery.isFetching}
              onClick={() => facilitiesQuery.refetch()}
            >
              Làm mới
            </Button>
            <Button icon={<PlusOutlined />} onClick={openCreateFacility} type="primary">
              Tạo cơ sở mới
            </Button>
          </Space>
        </div>

        <section className="grid flex-1 place-items-center py-12">
          <div className="w-full">
            <Typography.Title
              className="mb-3! text-center text-3xl! text-white! md:text-5xl!"
              level={1}
            >
              Bạn muốn quản lý cơ sở nào?
            </Typography.Title>
            <Typography.Paragraph className="mx-auto mb-12! max-w-2xl text-center text-base! text-slate-400!">
              Chọn một cơ sở để mọi dữ liệu booking, sân, giá và thanh toán được lọc theo
              cơ sở đó.
            </Typography.Paragraph>

            {facilitiesQuery.isLoading ? (
              <div className="grid grid-cols-2 justify-items-center gap-8 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="w-36 md:w-44" key={index}>
                    <Skeleton.Avatar active shape="square" size={176} />
                    <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  </div>
                ))}
              </div>
            ) : facilitiesQuery.isError ? (
              <div className="mx-auto max-w-md rounded-lg border border-red-400/30 bg-red-950/40 p-6 text-center">
                <Typography.Text className="text-red-100!">
                  Không tải được danh sách cơ sở.
                </Typography.Text>
                <div className="mt-4">
                  <Button onClick={() => facilitiesQuery.refetch()}>Thử lại</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-5">
                <button
                  className="group flex w-36 flex-col items-center gap-3 border-0 bg-transparent p-0 text-center outline-none md:w-44"
                  onClick={() => openWorkspace('all')}
                  type="button"
                >
                  <span className="grid aspect-square w-full place-items-center rounded-md border-2 border-transparent bg-slate-700 text-4xl text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition group-hover:border-white group-hover:bg-emerald-600 md:text-5xl">
                    <AppstoreOutlined />
                  </span>
                  <span className="line-clamp-2 min-h-11 text-base font-medium text-slate-300 transition group-hover:text-white">
                    Tất cả cơ sở
                  </span>
                  <span className="text-xs text-slate-500">Super Admin</span>
                </button>

                {(facilitiesQuery.data?.items ?? []).map(renderFacilityProfile)}
              </div>
            )}

            {!facilitiesQuery.isLoading && facilitiesQuery.data?.items.length === 0 && (
              <div className="mt-10">
                <Empty
                  description={<span className="text-slate-400">Chưa có cơ sở nào</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    icon={<PlusOutlined />}
                    onClick={openCreateFacility}
                    type="primary"
                  >
                    Tạo cơ sở đầu tiên
                  </Button>
                </Empty>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
