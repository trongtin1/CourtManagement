import { useCallback, useEffect, useState } from 'react'
import { Table, Tag, Input, Card, Button, Typography, Alert, Tooltip } from 'antd'
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { bookingApi } from '@/features/bookings/api/bookingApi'
import type { BookingHistoryResponse } from '@/features/bookings/model/types'

const { Text } = Typography

export function BookingHistoriesPage() {
  const [data, setData] = useState<BookingHistoryResponse[]>([])
  const [bookingIdInput, setBookingIdInput] = useState('')
  const [searchBookingId, setSearchBookingId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (idToSearch?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await bookingApi.getHistory(idToSearch?.trim() || undefined)
      setData(res || [])
    } catch (err: unknown) {
      console.error('Fetch history error:', err)
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi kết nối máy chủ hoặc mã Booking ID không hợp lệ'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchHistory()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchHistory])

  const handleSearch = () => {
    setSearchBookingId(bookingIdInput)
    fetchHistory(bookingIdInput)
  }

  const handleReset = () => {
    setBookingIdInput('')
    setSearchBookingId('')
    fetchHistory('')
  }

  const getActionTagColor = (action: string) => {
    switch (action) {
      case 'STATUS_UPDATE':
        return 'blue'
      case 'PAYMENT':
        return 'emerald'
      case 'RESCHEDULE':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const columns = [
    {
      title: 'Mã đặt sân',
      dataIndex: 'bookingID',
      key: 'bookingID',
      render: (id: string) => (
        <Tooltip title={id}>
          <Text
            copyable={{ text: id }}
            font-mono
            className="font-semibold text-xs text-slate-800"
          >
            {id.substring(0, 8)}...
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag
          color={getActionTagColor(action)}
          className="font-bold text-xs uppercase rounded"
        >
          {action}
        </Tag>
      ),
    },
    {
      title: 'Mô tả chi tiết',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => (
        <span className="text-slate-700 text-xs font-medium">{note}</span>
      ),
    },
    {
      title: 'Giá trị cũ',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (val: string) => (
        <Text
          type="secondary"
          className="text-xs font-mono max-w-50 truncate block"
          title={val}
        >
          {val || '—'}
        </Text>
      ),
    },
    {
      title: 'Giá trị mới',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (val: string) => (
        <Text
          type="success"
          className="text-xs font-mono max-w-50 truncate block font-semibold"
          title={val}
        >
          {val || '—'}
        </Text>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (user: string) => (
        <Text className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {user === 'system' || !user
            ? 'Hệ thống'
            : `Nhân viên (${user.substring(0, 8)})`}
        </Text>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => (
        <span className="text-slate-500 text-xs font-medium">
          {new Date(dateStr).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-400 mx-auto flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex justify-end">
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchHistory(searchBookingId)}
          loading={isLoading}
        >
          Làm mới
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border border-slate-100 rounded-xl">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:max-w-md">
            <Input
              placeholder="Nhập mã Booking ID (Guid) để tìm kiếm lịch sử..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={bookingIdInput}
              onChange={(e) => setBookingIdInput(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              size="medium"
              className="rounded-lg w-full"
            />
          </div>
          <div className="flex items-center gap-3 w-full justify-end">
            <Button
              type="primary"
              size="medium"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={isLoading}
              className="bg-teal-600 hover:bg-teal-700 rounded-lg flex-1 md:flex-none flex items-center justify-center"
            >
              Tìm kiếm
            </Button>
            <Button
              size="medium"
              onClick={handleReset}
              className="rounded-lg flex items-center justify-center"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          className="rounded-lg"
        />
      )}

      {/* Table Data */}
      <Card
        className="shadow-sm border border-slate-100 rounded-xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="bookingHistoryID"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng cộng ${total} bản ghi lịch sử`,
          }}
          className="custom-table"
        />
      </Card>

      <div className="mt-4 flex items-center gap-1.5 justify-end text-xs text-slate-400">
        <InfoCircleOutlined />
        <span>
          Trang này lấy dữ liệu thời gian thực trực tiếp từ hệ thống API không sử dụng
          React Query
        </span>
      </div>
    </div>
  )
}
