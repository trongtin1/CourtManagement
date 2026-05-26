import dayjs from 'dayjs'

// ─── Mock Courts ──────────────────────────────────────────────────────────────

export type MockCourt = {
  courtID: number
  courtName: string
  courtCode: string
  courtType: string
  statusColor: string
}

export const MOCK_COURTS: MockCourt[] = [
  { courtID: 1, courtName: 'Sân Cầu Lông A1', courtCode: 'CL-A1', courtType: 'Cầu lông', statusColor: '#10b981' },
  { courtID: 2, courtName: 'Sân Cầu Lông A2', courtCode: 'CL-A2', courtType: 'Cầu lông', statusColor: '#10b981' },
  { courtID: 3, courtName: 'Sân Cầu Lông A3', courtCode: 'CL-A3', courtType: 'Cầu lông', statusColor: '#10b981' },
  { courtID: 4, courtName: 'Sân Pickleball B1', courtCode: 'PB-B1', courtType: 'Pickleball', statusColor: '#6366f1' },
  { courtID: 5, courtName: 'Sân Pickleball B2', courtCode: 'PB-B2', courtType: 'Pickleball', statusColor: '#6366f1' },
  { courtID: 6, courtName: 'Sân Tennis C1', courtCode: 'TN-C1', courtType: 'Tennis', statusColor: '#f59e0b' },
]

// ─── Mock Time Slots ──────────────────────────────────────────────────────────

export type MockTimeSlot = {
  timeSlotID: number
  slotName: string
  startTime: string
  endTime: string
  startMinute: number
  endMinute: number
}

const SLOT_DEFS: [string, string, string][] = [
  ['Slot 1', '05:00', '06:00'],
  ['Slot 2', '06:00', '07:00'],
  ['Slot 3', '07:00', '08:00'],
  ['Slot 4', '08:00', '09:00'],
  ['Slot 5', '09:00', '10:00'],
  ['Slot 6', '10:00', '11:00'],
  ['Slot 7', '11:00', '12:00'],
  ['Slot 8', '12:00', '13:00'],
  ['Slot 9', '13:00', '14:00'],
  ['Slot 10', '14:00', '15:00'],
  ['Slot 11', '15:00', '16:00'],
  ['Slot 12', '16:00', '17:00'],
  ['Slot 13', '17:00', '18:00'],
  ['Slot 14', '18:00', '19:00'],
  ['Slot 15', '19:00', '20:00'],
  ['Slot 16', '20:00', '21:00'],
  ['Slot 17', '21:00', '22:00'],
]

const toMinute = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const MOCK_TIME_SLOTS: MockTimeSlot[] = SLOT_DEFS.map(([slotName, startTime, endTime], i) => ({
  timeSlotID: i + 1,
  slotName,
  startTime,
  endTime,
  startMinute: toMinute(startTime),
  endMinute: toMinute(endTime),
}))

// ─── Mock Customers ───────────────────────────────────────────────────────────

export type MockCustomer = {
  customerID: number
  fullName: string
  phone: string
  email: string
  customerType: string
  avatar: string
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  { customerID: 1, fullName: 'Nguyễn Văn An', phone: '0901 234 567', email: 'an.nguyen@email.com', customerType: 'VIP', avatar: 'NVA' },
  { customerID: 2, fullName: 'Trần Thị Bình', phone: '0912 345 678', email: 'binh.tran@email.com', customerType: 'Thường', avatar: 'TTB' },
  { customerID: 3, fullName: 'Lê Hoàng Cường', phone: '0923 456 789', email: 'cuong.le@email.com', customerType: 'Thường', avatar: 'LHC' },
  { customerID: 4, fullName: 'Phạm Minh Đức', phone: '0934 567 890', email: 'duc.pham@email.com', customerType: 'VIP', avatar: 'PMĐ' },
  { customerID: 5, fullName: 'Hoàng Thu Hà', phone: '0945 678 901', email: 'ha.hoang@email.com', customerType: 'Thường', avatar: 'HTH' },
  { customerID: 6, fullName: 'Võ Quang Huy', phone: '0956 789 012', email: 'huy.vo@email.com', customerType: 'Cố định', avatar: 'VQH' },
  { customerID: 7, fullName: 'Đặng Ngọc Linh', phone: '0967 890 123', email: 'linh.dang@email.com', customerType: 'Cố định', avatar: 'ĐNL' },
]

// ─── Mock Services ────────────────────────────────────────────────────────────

export type MockService = {
  serviceID: number
  serviceName: string
  unitPrice: number
  unit: string
  icon: string
}

export const MOCK_SERVICES: MockService[] = [
  { serviceID: 1, serviceName: 'Nước suối', unitPrice: 10000, unit: 'chai', icon: '💧' },
  { serviceID: 2, serviceName: 'Nước tăng lực', unitPrice: 20000, unit: 'lon', icon: '⚡' },
  { serviceID: 3, serviceName: 'Cho thuê vợt', unitPrice: 30000, unit: 'cây', icon: '🏸' },
  { serviceID: 4, serviceName: 'Cầu lông (ống)', unitPrice: 80000, unit: 'ống', icon: '🪶' },
  { serviceID: 5, serviceName: 'Khăn lạnh', unitPrice: 5000, unit: 'cái', icon: '🧊' },
  { serviceID: 6, serviceName: 'Tủ khóa', unitPrice: 15000, unit: 'lượt', icon: '🔐' },
]

// ─── Mock Locked Slots ────────────────────────────────────────────────────────

export type MockLockedSlot = {
  courtID: number
  startTime: string
  endTime: string
  reason: string
  date: string
}

const today = dayjs().format('YYYY-MM-DD')
const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

export const MOCK_LOCKED_SLOTS: MockLockedSlot[] = [
  { courtID: 1, startTime: '12:00', endTime: '13:00', reason: 'Bảo trì lưới', date: today },
  { courtID: 3, startTime: '14:00', endTime: '16:00', reason: 'Sửa chữa đèn chiếu sáng', date: today },
  { courtID: 6, startTime: '08:00', endTime: '10:00', reason: 'Sự kiện nội bộ', date: tomorrow },
]

// ─── Mock Bookings ────────────────────────────────────────────────────────────

export type MockBookingSlot = {
  timeSlotID: number
  startTime: string
  endTime: string
  price: number
}

export type MockBooking = {
  bookingID: string
  courtID: number
  customerID: number
  bookingDate: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'playing' | 'completed' | 'cancelled'
  note: string
  createdDate: string
  slots: MockBookingSlot[]
  services: { serviceID: number; quantity: number; unitPrice: number }[]
  paymentStatus: 'unpaid' | 'partial' | 'paid'
}

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    bookingID: 'BK-20260526-001',
    courtID: 1,
    customerID: 1,
    bookingDate: today,
    totalAmount: 350000,
    status: 'confirmed',
    note: 'Khách VIP, chuẩn bị nước sẵn',
    createdDate: dayjs().subtract(2, 'hour').toISOString(),
    slots: [
      { timeSlotID: 14, startTime: '18:00', endTime: '19:00', price: 150000 },
      { timeSlotID: 15, startTime: '19:00', endTime: '20:00', price: 150000 },
    ],
    services: [{ serviceID: 4, quantity: 1, unitPrice: 80000 }],
    paymentStatus: 'paid',
  },
  {
    bookingID: 'BK-20260526-002',
    courtID: 2,
    customerID: 2,
    bookingDate: today,
    totalAmount: 200000,
    status: 'playing',
    note: '',
    createdDate: dayjs().subtract(1, 'hour').toISOString(),
    slots: [
      { timeSlotID: 13, startTime: '17:00', endTime: '18:00', price: 100000 },
      { timeSlotID: 14, startTime: '18:00', endTime: '19:00', price: 100000 },
    ],
    services: [],
    paymentStatus: 'unpaid',
  },
  {
    bookingID: 'BK-20260526-003',
    courtID: 4,
    customerID: 3,
    bookingDate: today,
    totalAmount: 280000,
    status: 'pending',
    note: 'Khách mới, cần hướng dẫn',
    createdDate: dayjs().subtract(30, 'minute').toISOString(),
    slots: [
      { timeSlotID: 15, startTime: '19:00', endTime: '20:00', price: 120000 },
      { timeSlotID: 16, startTime: '20:00', endTime: '21:00', price: 120000 },
    ],
    services: [{ serviceID: 3, quantity: 2, unitPrice: 30000 }],
    paymentStatus: 'unpaid',
  },
  {
    bookingID: 'BK-20260526-004',
    courtID: 1,
    customerID: 4,
    bookingDate: today,
    totalAmount: 150000,
    status: 'completed',
    note: '',
    createdDate: dayjs().subtract(6, 'hour').toISOString(),
    slots: [
      { timeSlotID: 5, startTime: '09:00', endTime: '10:00', price: 80000 },
      { timeSlotID: 6, startTime: '10:00', endTime: '11:00', price: 80000 },
    ],
    services: [{ serviceID: 1, quantity: 2, unitPrice: 10000 }],
    paymentStatus: 'paid',
  },
  {
    bookingID: 'BK-20260526-005',
    courtID: 5,
    customerID: 5,
    bookingDate: today,
    totalAmount: 240000,
    status: 'confirmed',
    note: '',
    createdDate: dayjs().subtract(4, 'hour').toISOString(),
    slots: [
      { timeSlotID: 16, startTime: '20:00', endTime: '21:00', price: 120000 },
      { timeSlotID: 17, startTime: '21:00', endTime: '22:00', price: 120000 },
    ],
    services: [],
    paymentStatus: 'partial',
  },
  {
    bookingID: 'BK-20260526-006',
    courtID: 3,
    customerID: 6,
    bookingDate: today,
    totalAmount: 300000,
    status: 'cancelled',
    note: 'Khách hủy do trời mưa',
    createdDate: dayjs().subtract(5, 'hour').toISOString(),
    slots: [
      { timeSlotID: 12, startTime: '16:00', endTime: '17:00', price: 100000 },
      { timeSlotID: 13, startTime: '17:00', endTime: '18:00', price: 100000 },
    ],
    services: [{ serviceID: 2, quantity: 4, unitPrice: 20000 }],
    paymentStatus: 'unpaid',
  },
  {
    bookingID: 'BK-20260526-007',
    courtID: 6,
    customerID: 7,
    bookingDate: today,
    totalAmount: 400000,
    status: 'confirmed',
    note: 'Nhóm cố định thứ 2 hàng tuần',
    createdDate: dayjs().subtract(1, 'day').toISOString(),
    slots: [
      { timeSlotID: 14, startTime: '18:00', endTime: '19:00', price: 200000 },
      { timeSlotID: 15, startTime: '19:00', endTime: '20:00', price: 200000 },
    ],
    services: [],
    paymentStatus: 'paid',
  },
  {
    bookingID: 'BK-20260527-001',
    courtID: 2,
    customerID: 1,
    bookingDate: tomorrow,
    totalAmount: 250000,
    status: 'pending',
    note: '',
    createdDate: dayjs().subtract(20, 'minute').toISOString(),
    slots: [
      { timeSlotID: 14, startTime: '18:00', endTime: '19:00', price: 150000 },
    ],
    services: [{ serviceID: 1, quantity: 3, unitPrice: 10000 }, { serviceID: 4, quantity: 1, unitPrice: 80000 }],
    paymentStatus: 'unpaid',
  },
  {
    bookingID: 'BK-20260527-002',
    courtID: 4,
    customerID: 4,
    bookingDate: tomorrow,
    totalAmount: 360000,
    status: 'confirmed',
    note: 'Đặt trước cho cuối tuần',
    createdDate: dayjs().subtract(3, 'hour').toISOString(),
    slots: [
      { timeSlotID: 15, startTime: '19:00', endTime: '20:00', price: 120000 },
      { timeSlotID: 16, startTime: '20:00', endTime: '21:00', price: 120000 },
      { timeSlotID: 17, startTime: '21:00', endTime: '22:00', price: 120000 },
    ],
    services: [],
    paymentStatus: 'unpaid',
  },
  {
    bookingID: 'BK-20260525-001',
    courtID: 1,
    customerID: 3,
    bookingDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    totalAmount: 180000,
    status: 'completed',
    note: '',
    createdDate: dayjs().subtract(1, 'day').toISOString(),
    slots: [
      { timeSlotID: 3, startTime: '07:00', endTime: '08:00', price: 60000 },
      { timeSlotID: 4, startTime: '08:00', endTime: '09:00', price: 60000 },
    ],
    services: [{ serviceID: 5, quantity: 4, unitPrice: 5000 }, { serviceID: 1, quantity: 4, unitPrice: 10000 }],
    paymentStatus: 'paid',
  },
]

// ─── Slot Price map (mock, for booking-creation) ──────────────────────────────

export const getSlotPrice = (courtID: number, _dayOfWeek: number, startTime: string): number => {
  const hour = parseInt(startTime.split(':')[0], 10)
  const courtType = MOCK_COURTS.find(c => c.courtID === courtID)?.courtType
  const base = courtType === 'Tennis' ? 200000 : courtType === 'Pickleball' ? 120000 : 100000
  if (hour >= 17 && hour < 21) return base * 1.5
  if (hour >= 6 && hour < 8) return base * 1.2
  return base
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#eff6ff', dot: '#3b82f6' },
  playing: { label: 'Đang chơi', color: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  completed: { label: 'Hoàn tất', color: '#6b7280', bg: '#f9fafb', dot: '#9ca3af' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
}

export const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  unpaid: { label: 'Chưa thanh toán', color: '#ef4444' },
  partial: { label: 'Thanh toán một phần', color: '#f59e0b' },
  paid: { label: 'Đã thanh toán', color: '#10b981' },
}
