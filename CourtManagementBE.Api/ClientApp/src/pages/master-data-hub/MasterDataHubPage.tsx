import { Link } from 'react-router-dom'
import { Card, Col, Row, Space } from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarOutlined,
  ShopOutlined,
  SwapOutlined,
  TagsOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons'

import { ROUTES } from '@/constants/routes'

const masterDataGroups = [
  {
    title: 'Quản lý Sân & Cơ sở',
    items: [
      {
        name: 'Cơ sở',
        desc: 'Chi nhánh/Cụm sân',
        path: ROUTES.facilities,
        icon: <ShopOutlined />,
      },
      {
        name: 'Khu vực',
        desc: 'Khu vực trong cơ sở',
        path: ROUTES.areas,
        icon: <AppstoreOutlined />,
      },
      {
        name: 'Loại sân',
        desc: 'Phân loại sân',
        path: ROUTES.courtTypes,
        icon: <DashboardOutlined />,
      },
      {
        name: 'Trạng thái sân',
        desc: 'Hoạt động, bảo trì...',
        path: ROUTES.courtStatuses,
        icon: <ToolOutlined />,
      },
      {
        name: 'Loại đặc điểm sân',
        desc: 'Cao điểm, thấp điểm, ngày lễ...',
        path: ROUTES.priceRuleTypes,
        icon: <DollarOutlined />,
      },
      {
        name: 'Nhóm đặc điểm sân',
        desc: 'Phân nhóm đặc điểm',
        path: ROUTES.courtFeatureCategories,
        icon: <TagsOutlined />,
      },
      {
        name: 'Đặc điểm sân',
        desc: 'Indoor, outdoor, VIP...',
        path: ROUTES.courtFeatures,
        icon: <TagsOutlined />,
      },
    ],
  },
  {
    title: 'Tài sản & Tiện ích',
    items: [
      {
        name: 'Danh mục tài sản',
        desc: 'Phân loại thiết bị',
        path: ROUTES.assetCategories,
        icon: <AppstoreOutlined />,
      },
      {
        name: 'Tình trạng tài sản',
        desc: 'Mới, hỏng, sửa chữa',
        path: ROUTES.assetConditions,
        icon: <ToolOutlined />,
      },
      {
        name: 'Đơn vị tính',
        desc: 'Cái, chiếc, giờ...',
        path: ROUTES.units,
        icon: <DashboardOutlined />,
      },
      {
        name: 'Quy đổi đơn vị',
        desc: 'Thiết lập quy đổi giữa các đơn vị',
        path: ROUTES.units,
        icon: <SwapOutlined />,
      },
      {
        name: 'Loại dịch vụ',
        desc: 'Dịch vụ bán kèm',
        path: ROUTES.serviceTypes,
        icon: <ShopOutlined />,
      },
    ],
  },
  {
    title: 'Giao dịch & Booking',
    items: [
      {
        name: 'Trạng thái đặt sân',
        desc: 'Chờ xác nhận, đã hủy...',
        path: ROUTES.bookingStatuses,
        icon: <CalendarOutlined />,
      },
      {
        name: 'Lý do hủy',
        desc: 'Lý do hủy booking',
        path: ROUTES.cancellationReasons,
        icon: <ToolOutlined />,
      },
      {
        name: 'Trạng thái thanh toán',
        desc: 'Thành công, thất bại...',
        path: ROUTES.paymentStatuses,
        icon: <CreditCardOutlined />,
      },
      {
        name: 'Phương thức thanh toán',
        desc: 'Tiền mặt, CK...',
        path: ROUTES.paymentMethods,
        icon: <DollarOutlined />,
      },
      {
        name: 'Lý do hoàn tiền',
        desc: 'Lý do refund',
        path: ROUTES.refundReasons,
        icon: <ToolOutlined />,
      },
    ],
  },
  {
    title: 'Khách hàng',
    items: [
      {
        name: 'Loại khách hàng',
        desc: 'Thường, VIP...',
        path: ROUTES.customerTypes,
        icon: <UsergroupAddOutlined />,
      },
    ],
  },
]

export function MasterDataHubPage() {
  return (
    <Space className="w-full" direction="vertical" size={24}>
      <Space className="w-full" direction="vertical" size={32}>
        {masterDataGroups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-4! text-lg font-semibold">{group.title}</h4>
            <Row gutter={[16, 16]}>
              {group.items.map((item) => (
                <Col key={item.path} lg={6} md={8} sm={12} xs={24}>
                  <Link to={item.path}>
                    <Card
                      className="h-full cursor-pointer border-slate-200 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                      size="small"
                    >
                      <Card.Meta
                        avatar={
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-xl text-blue-600">
                            {item.icon}
                          </div>
                        }
                        description={<span className="text-slate-500">{item.desc}</span>}
                        title={
                          <span className="font-semibold text-slate-800">
                            {item.name}
                          </span>
                        }
                      />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Space>
    </Space>
  )
}
