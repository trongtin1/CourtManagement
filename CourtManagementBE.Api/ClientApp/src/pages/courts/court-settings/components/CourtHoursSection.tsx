import { Button, Card, Col, Row, Space, Switch, TimePicker, Typography } from 'antd'
import { ClockCircleOutlined, CopyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export function CourtHoursSection({ schedule, setSchedule }: any) {
  const update = (i: number, patch: any) => {
    const next = [...schedule]
    next[i] = { ...next[i], ...patch }
    setSchedule(next)
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: '24px 24px 24px 24px',
      }}
    >
      {/* Header */}
      <Space align="start" size={16} style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#e6f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1677ff',
            fontSize: 20,
          }}
        >
          <ClockCircleOutlined />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
            Giờ hoạt động
          </Title>
          <Text type="secondary">
            Cấu hình giờ mở cửa từng ngày trong tuần. Có thể sao chép sang các ngày khác.
          </Text>
        </div>
      </Space>

      {/* Grid */}
      <Row gutter={[24, 24]}>
        {schedule.map((d: any, i: number) => (
          <Col span={12} key={d.day}>
            <Card
              styles={{
                body: { padding: '20px 24px' },
              }}
              style={{
                borderRadius: 24,
                borderColor: d.open ? '#f0f0f0' : '#f5f5f5',
                background: d.open ? '#fff' : '#fafafa',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: d.open ? '#000' : '#bfbfbf',
                    }}
                  >
                    {d.day}
                  </div>
                  <div style={{ color: '#8c8c8c', fontSize: 14, marginTop: 4 }}>
                    {d.open ? `${d.start} → ${d.end}` : 'Đóng cửa'}
                  </div>
                </div>
                <Switch
                  checked={d.open}
                  onChange={(b) => update(i, { open: b })}
                  style={{ background: d.open ? '#ff7a00' : undefined }}
                />
              </div>

              {/* Card Body */}
              {d.open && (
                <>
                  <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={12}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
                      >
                        Mở cửa
                      </Text>
                      <TimePicker
                        value={d.start ? dayjs(d.start, 'HH:mm') : null}
                        format="hh:mm A"
                        use12Hours
                        allowClear={false}
                        onChange={(val) => {
                          if (val) update(i, { start: val.format('HH:mm') })
                        }}
                        style={{ width: '100%', borderRadius: 24, padding: '6px 16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
                      >
                        Đóng cửa
                      </Text>
                      <TimePicker
                        value={d.end ? dayjs(d.end, 'HH:mm') : null}
                        format="hh:mm A"
                        use12Hours
                        allowClear={false}
                        onChange={(val) => {
                          if (val) update(i, { end: val.format('HH:mm') })
                        }}
                        style={{ width: '100%', borderRadius: 24, padding: '6px 16px' }}
                      />
                    </Col>
                  </Row>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      shape="round"
                      style={{
                        color: '#595959',
                        borderColor: '#d9d9d9',
                        padding: '4px 16px',
                      }}
                    >
                      + Nghỉ giữa giờ
                    </Button>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      style={{ color: '#595959' }}
                    >
                      Sao chép lịch
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
