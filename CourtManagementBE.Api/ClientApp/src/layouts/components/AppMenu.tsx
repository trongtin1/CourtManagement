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
    title: 'T\u1ed5ng quan',
    description:
      'Theo d\u00f5i nhanh t\u00ecnh h\u00ecnh s\u00e2n, booking v\u00e0 doanh thu.',
  },
  facilities: {
    title: 'C\u01a1 s\u1edf',
    description: 'Master data cho chi nh\u00e1nh ho\u1eb7c c\u1ee5m s\u00e2n.',
  },
  areas: {
    title: 'Khu v\u1ef1c',
    description: 'Master data khu v\u1ef1c trong t\u1eebng c\u01a1 s\u1edf.',
  },
  courts: {
    title: 'S\u00e2n',
    description:
      'Thi\u1ebft l\u1eadp s\u00e2n thu\u1ed9c c\u01a1 s\u1edf \u0111ang l\u00e0m vi\u1ec7c.',
  },
  courtTypes: {
    title: 'Lo\u1ea1i s\u00e2n',
    description: 'Master data lo\u1ea1i s\u00e2n d\u00f9ng khi t\u1ea1o s\u00e2n.',
  },
  courtStatuses: {
    title: 'Tr\u1ea1ng th\u00e1i s\u00e2n',
    description: 'Master data tr\u1ea1ng th\u00e1i v\u1eadn h\u00e0nh c\u1ee7a s\u00e2n.',
  },
  courtFeatures: {
    title: '\u0110\u1eb7c \u0111i\u1ec3m s\u00e2n',
    description:
      'Master data \u0111\u1eb7c \u0111i\u1ec3m nh\u01b0 indoor, outdoor, VIP.',
  },
  courtFeatureMappings: {
    title: 'G\u00e1n \u0111\u1eb7c \u0111i\u1ec3m',
    description:
      'Thi\u1ebft l\u1eadp \u0111\u1eb7c \u0111i\u1ec3m cho t\u1eebng s\u00e2n.',
  },
  courtAssets: {
    title: 'T\u00e0i s\u1ea3n s\u00e2n',
    description:
      'Theo d\u00f5i thi\u1ebft b\u1ecb, t\u00e0i s\u1ea3n v\u00e0 b\u1ea3o tr\u00ec.',
  },
  courtPriceSetting: {
    title: 'Cấu hình giá sân chung',
    description: 'Thiết lập mẫu giá mặc định theo ngày trong tuần và khung giờ.',
  },
  bookings: {
    title: '\u0110\u1eb7t s\u00e2n',
    description: 'Theo d\u00f5i, t\u1ea1o m\u1edbi v\u00e0 x\u1eed l\u00fd booking.',
  },
  timeSlots: {
    title: 'Khung gi\u1edd',
    description:
      'Master data khung gi\u1edd d\u00f9ng cho gi\u00e1 v\u00e0 booking slot.',
  },
  services: {
    title: 'D\u1ecbch v\u1ee5',
    description: 'Master data d\u1ecbch v\u1ee5 b\u00e1n k\u00e8m booking.',
  },
  combos: {
    title: 'Gói Combo',
    description: 'Thiết lập và quản lý các gói combo đặt sân kèm quà tặng/dịch vụ.',
  },
  utilities: {
    title: 'Ti\u1ec7n \u00edch',
    description:
      'Master data ti\u1ec7n \u00edch d\u00f9ng \u0111\u1ec3 g\u00e1n cho s\u00e2n.',
  },
  customers: {
    title: 'Kh\u00e1ch h\u00e0ng',
    description:
      'Qu\u1ea3n l\u00fd h\u1ed3 s\u01a1 v\u00e0 l\u1ecbch s\u1eed kh\u00e1ch h\u00e0ng.',
  },
  payments: {
    title: 'Thanh to\u00e1n',
    description:
      'Theo d\u00f5i giao d\u1ecbch, tr\u1ea1ng th\u00e1i v\u00e0 ho\u00e0n ti\u1ec1n.',
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
      label: 'Court Setup',
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
