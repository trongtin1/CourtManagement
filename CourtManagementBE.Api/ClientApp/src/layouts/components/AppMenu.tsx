import { Link } from 'react-router-dom'
import {
  AppstoreOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DollarOutlined,
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
  GiftOutlined,
  ShopOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

export type MenuItem = {
  key: string
  icon?: ReactNode
  label: ReactNode | string
  children?: MenuItem[]
  disabled?: boolean
}

export const pageMeta: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'Tổng quan',
    description: 'Theo dõi nhanh tình hình sân, booking và doanh thu.',
  },
  facilities: {
    title: 'Cơ sở',
    description: 'Master data cho chi nhánh hoặc cụm sân.',
  },
  areas: {
    title: 'Khu vực',
    description: 'Master data khu vực trong từng cơ sở.',
  },
  courts: {
    title: 'Sân',
    description: 'Thiết lập sân thuộc cơ sở đang làm việc.',
  },
  'court-types': {
    title: 'Loại sân',
    description: 'Master data loại sân dùng khi tạo sân.',
  },
  'court-statuses': {
    title: 'Trạng thái sân',
    description: 'Master data trạng thái vận hành của sân.',
  },
  'court-features': {
    title: 'Đặc điểm sân',
    description: 'Master data đặc điểm như indoor, outdoor, VIP.',
  },
  'court-feature-mappings': {
    title: 'Gán đặc điểm',
    description: 'Thiết lập đặc điểm cho từng sân.',
  },
  'court-assets': {
    title: 'Tài sản sân',
    description: 'Theo dõi thiết bị, tài sản và bảo trì.',
  },
  'court-price-setting': {
    title: 'Cấu hình giá sân chung',
    description: 'Thiết lập mẫu giá mặc định theo ngày trong tuần và khung giờ.',
  },
  bookings: {
    title: 'Đặt sân',
    description: 'Theo dõi, tạo mới và xử lý booking.',
  },
  'time-slots': {
    title: 'Khung giờ',
    description: 'Master data khung giờ dùng cho giá và booking slot.',
  },
  services: {
    title: 'Dịch vụ',
    description: 'Master data dịch vụ bán kèm booking.',
  },
  combos: {
    title: 'Gói Combo',
    description: 'Thiết lập và quản lý các gói combo đặt sân kèm quà tặng/dịch vụ.',
  },
  utilities: {
    title: 'Tiện ích',
    description: 'Master data tiện ích dùng để gán cho sân.',
  },
  customers: {
    title: 'Khách hàng',
    description: 'Quản lý hồ sơ và lịch sử khách hàng.',
  },
  payments: {
    title: 'Thanh toán',
    description: 'Theo dõi giao dịch, trạng thái và hoàn tiền.',
  },
  'booking-histories': {
    title: 'Lịch sử thay đổi Booking',
    description: 'Theo dõi nhật ký cập nhật trạng thái, thanh toán cọc và dời lịch.',
  },
  // Thêm các trang master data khác để tránh bị fallback về Dashboard
  'price-rule-types': {
    title: 'Loại quy tắc giá',
    description: 'Quản lý các loại quy tắc áp dụng giá cho khung giờ.',
  },
  'booking-statuses': {
    title: 'Trạng thái đặt sân',
    description: 'Danh mục các trạng thái của đơn đặt sân.',
  },
  'payment-statuses': {
    title: 'Trạng thái thanh toán',
    description: 'Danh mục các trạng thái thanh toán của hóa đơn.',
  },
  'payment-methods': {
    title: 'Phương thức thanh toán',
    description: 'Các phương thức thanh toán được hỗ trợ trong hệ thống.',
  },
  'customer-types': {
    title: 'Nhóm khách hàng',
    description: 'Phân loại các nhóm khách hàng thành viên.',
  },
  'service-types': {
    title: 'Loại dịch vụ',
    description: 'Phân loại dịch vụ cung cấp tại sân.',
  },
  units: {
    title: 'Đơn vị tính',
    description: 'Đơn vị đo lường cho hàng hóa, dịch vụ và tài sản.',
  },
  'asset-categories': {
    title: 'Danh mục tài sản',
    description: 'Các nhóm danh mục quản lý tài sản, trang thiết bị.',
  },
  'asset-conditions': {
    title: 'Tình trạng tài sản',
    description: 'Các trạng thái ghi nhận chất lượng của tài sản.',
  },
  'court-feature-categories': {
    title: 'Danh mục đặc điểm sân',
    description: 'Phân nhóm các đặc điểm đặc thù của sân.',
  },
  'cancellation-reasons': {
    title: 'Lý do hủy đặt sân',
    description: 'Danh mục lý do khi khách hàng yêu cầu hủy lịch.',
  },
  'refund-reasons': {
    title: 'Lý do hoàn tiền',
    description: 'Danh mục lý do khi thực hiện hoàn tiền giao dịch.',
  },
  'system-settings': {
    title: 'Thiết lập hệ thống',
    description: 'Cấu hình thông số vận hành chung của hệ thống.',
  },
}

export const getMenuItems = (): MenuItem[] => {
  return [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">{'T\u1ed5ng quan'}</Link>,
    },
    {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: <Link to="/master-data-hub">Cấu hình chung</Link>,
    },
    {
      key: 'court-setup',
      icon: <SettingOutlined />,
      label: 'Cấu hình sân',
      children: [
        {
          key: 'courts',
          icon: <AppstoreOutlined />,
          label: <Link to="/courts">{'S\u00e2n'}</Link>,
        },
        {
          key: 'court-assets',
          icon: <PictureOutlined />,
          label: <Link to="/court-assets">{'T\u00e0i s\u1ea3n s\u00e2n'}</Link>,
        },
        {
          key: 'court-price-setting',
          icon: <DollarOutlined />,
          label: <Link to="/court-price-setting">Cấu hình giá sân chung</Link>,
        },
      ],
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: <Link to="/bookings">{'\u0110\u1eb7t s\u00e2n'}</Link>,
    },
    {
      key: 'booking-histories',
      icon: <HistoryOutlined />,
      label: <Link to="/booking-histories">Nhật ký Booking</Link>,
    },
    {
      key: 'services-combos',
      icon: <ShopOutlined />,
      label: 'Dịch vụ & Combo',
      children: [
        {
          key: 'services',
          icon: <AppstoreOutlined />,
          label: <Link to="/services">Dịch vụ bán kèm</Link>,
        },
        {
          key: 'combos',
          icon: <GiftOutlined />,
          label: <Link to="/combos">Gói Combo</Link>,
        },
      ],
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: <Link to="/payments">{'Thanh to\u00e1n'}</Link>,
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link to="/customers">{'Kh\u00e1ch h\u00e0ng'}</Link>,
    },
  ]
}

export default getMenuItems
