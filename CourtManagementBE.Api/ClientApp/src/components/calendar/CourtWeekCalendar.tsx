import dayjs from 'dayjs'
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar'
import type { CalendarProps, Event } from 'react-big-calendar'
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { COURT_WEEK_CALENDAR_FORMATS } from './courtWeekCalendarFormats'

const withDragAndDrop: typeof _withDragAndDrop =
  (_withDragAndDrop as unknown as { default?: typeof _withDragAndDrop }).default ??
  _withDragAndDrop

const localizer = dayjsLocalizer(dayjs)
const DnDCalendar = withDragAndDrop(Calendar)

type InternalCalendarProps = CalendarProps<object, object>

export type CourtWeekCalendarEvent = Event & {
  id: string | number
  title: string
  start: Date
  end: Date
  resource?: unknown
}

export type CourtWeekCalendarProps<TEvent extends object = CourtWeekCalendarEvent> = {
  events: TEvent[]
  date: Date
  minTime: Date
  maxTime: Date
  step?: number
  timeslots?: number
  selectable?: boolean
  resizable?: boolean
  enableDragAndDrop?: boolean
  className?: string
  wrapperClassName?: string
  components?: CalendarProps<TEvent>['components']
  eventPropGetter?: CalendarProps<TEvent>['eventPropGetter']
  slotPropGetter?: CalendarProps<TEvent>['slotPropGetter']
  formats?: CalendarProps<TEvent>['formats']
  onSelectSlot?: CalendarProps<TEvent>['onSelectSlot']
  onSelectEvent?: CalendarProps<TEvent>['onSelectEvent']
  onEventDrop?: (args: EventInteractionArgs<TEvent>) => void
  onEventResize?: (args: EventInteractionArgs<TEvent>) => void
}

export function CourtWeekCalendar<TEvent extends object = CourtWeekCalendarEvent>({
  events,
  date,
  minTime,
  maxTime,
  step = 60,
  timeslots = 1,
  selectable = true,
  resizable = false,
  enableDragAndDrop = false,
  className = 'h-240',
  wrapperClassName = 'rbc-court-wrapper rounded-2xl border border-slate-100 shadow-sm overflow-y-auto overflow-hidden',
  components,
  eventPropGetter,
  slotPropGetter,
  formats = COURT_WEEK_CALENDAR_FORMATS,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  onEventResize,
}: CourtWeekCalendarProps<TEvent>) {
  const calendarProps: InternalCalendarProps = {
    localizer,
    events: events as object[],
    defaultView: Views.WEEK,
    views: [Views.WEEK],
    date,
    min: minTime,
    max: maxTime,
    step,
    timeslots,
    selectable,
    components: components as InternalCalendarProps['components'],
    eventPropGetter: eventPropGetter as InternalCalendarProps['eventPropGetter'],
    slotPropGetter: slotPropGetter as InternalCalendarProps['slotPropGetter'],
    onSelectSlot: onSelectSlot as InternalCalendarProps['onSelectSlot'],
    onSelectEvent: onSelectEvent as InternalCalendarProps['onSelectEvent'],
    scrollToTime: minTime,
    formats,
    className,
  }

  if (enableDragAndDrop) {
    return (
      <div className={wrapperClassName}>
        <DnDCalendar
          {...calendarProps}
          resizable={resizable}
          onEventDrop={
            onEventDrop as ((args: EventInteractionArgs<object>) => void) | undefined
          }
          onEventResize={
            onEventResize as ((args: EventInteractionArgs<object>) => void) | undefined
          }
        />
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <Calendar {...calendarProps} />
    </div>
  )
}

export type { EventInteractionArgs }
