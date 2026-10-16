import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

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

export const getMonday = (): dayjs.Dayjs => {
  const dow = dayjs().day()
  const diff = dow === 0 ? -6 : 1 - dow
  return dayjs().add(diff, 'day').startOf('day')
}

export const gridDayLabel = (day: number): string =>
  dayjs()
    .day(day === 6 ? 0 : day + 1)
    .format('dddd')

export const getDisabledTime = (
  openingTime?: string | null,
  closingTime?: string | null,
) => {
  if (!openingTime || !closingTime) return undefined

  const [startH, startM] = openingTime.split(':').map(Number)
  const [endH, endM] = closingTime.split(':').map(Number)

  return () => {
    return {
      disabledHours: () => {
        const hours = []
        for (let i = 0; i < 24; i++) {
          if (i < startH || i > endH) {
            hours.push(i)
          }
        }
        return hours
      },
      disabledMinutes: (selectedHour: number) => {
        const minutes = []
        if (selectedHour === startH) {
          for (let i = 0; i < 60; i++) {
            if (i < startM) minutes.push(i)
          }
        } else if (selectedHour === endH) {
          for (let i = 0; i < 60; i++) {
            if (i > endM) minutes.push(i)
          }
        }
        return minutes
      },
      disabledSeconds: () => [],
    }
  }
}
