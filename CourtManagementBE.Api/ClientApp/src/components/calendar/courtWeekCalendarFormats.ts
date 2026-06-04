import dayjs from 'dayjs'

export const COURT_WEEK_CALENDAR_FORMATS = {
  dayFormat: (date: Date) => {
    const d = dayjs(date)
    const dow = d.day()
    const label = dow === 0 ? 'CN' : `T${dow + 1}`
    return `${label} (${d.format('DD/MM')})`
  },
  timeGutterFormat: (date: Date) => dayjs(date).format('HH:mm'),
}
