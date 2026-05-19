export const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0)

export const formatCompactCurrency = (value?: number | null) =>
  `${(value ?? 0).toLocaleString('vi-VN')}đ`

export const formatTime = (value?: string | null) => (value ? value.slice(0, 5) : '')

export const toTimeSpan = (value: string) => (value.length === 5 ? `${value}:00` : value)

export const formatMinutesAsTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
