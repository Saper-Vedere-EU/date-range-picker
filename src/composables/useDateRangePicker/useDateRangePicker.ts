import { ref, computed, type Ref } from 'vue'
import type { PickerState, YearMonth, DayInfo, MonthGrid } from './types'
import {
  isSameDay,
  isSameMonth,
  prevMonth,
  nextMonth,
  orderDates,
  generateMonthGrid,
  yearMonthFromDate,
  compareYearMonth,
} from './calendar-utils'

export interface UseDateRangePickerOptions {
  committedStart: Ref<Date | undefined>
  committedEnd: Ref<Date | undefined>
}

export function useDateRangePicker(options: UseDateRangePickerOptions) {
  const { committedStart, committedEnd } = options

  const mode = ref<PickerState>('idle')

  const today = new Date()
  const initialYm = committedStart.value
    ? yearMonthFromDate(committedStart.value)
    : yearMonthFromDate(today)

  const leftMonth = ref<YearMonth>({ ...initialYm })
  const rightMonth = ref<YearMonth>(nextMonth(initialYm))

  // selecting state
  const anchor = ref<Date | null>(null)

  // selected state
  const tentativeStart = ref<Date | null>(null)
  const tentativeEnd = ref<Date | null>(null)
  const committedStartSnapshot = ref<Date | undefined>(undefined)
  const committedEndSnapshot = ref<Date | undefined>(undefined)

  // drag state (active only in "selected" mode)
  const draggingKind = ref<'start' | 'end' | 'range' | null>(null)
  const dragHoverDate = ref<Date | null>(null)
  /** For "range" kind: the in-range day the user originally grabbed */
  const dragAnchorDate = ref<Date | null>(null)
  /** Which calendar the dragged boundary was visible on at drag start */
  const dragSourceSide = ref<'left' | 'right' | null>(null)

  // --- Range computation ---

  function shiftByDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  function previewRange(): [Date, Date] | null {
    if (!draggingKind.value || !dragHoverDate.value) return null

    if (draggingKind.value === 'range') {
      if (!dragAnchorDate.value || !tentativeStart.value || !tentativeEnd.value) {
        return null
      }
      const daysDelta = Math.round(
        (dragHoverDate.value.getTime() - dragAnchorDate.value.getTime()) / 86400000,
      )
      if (daysDelta === 0) return null
      return [
        shiftByDays(tentativeStart.value, daysDelta),
        shiftByDays(tentativeEnd.value, daysDelta),
      ]
    }

    const other = draggingKind.value === 'start' ? tentativeEnd.value : tentativeStart.value
    if (!other) return null
    return orderDates(dragHoverDate.value, other)
  }

  const rangeStart = computed<Date | null>(() => {
    if (mode.value === 'selected') {
      const preview = previewRange()
      if (preview) return preview[0]
      return tentativeStart.value
    }
    if (mode.value === 'idle' && committedStart.value && committedEnd.value) {
      return committedStart.value
    }
    return null
  })

  const rangeEnd = computed<Date | null>(() => {
    if (mode.value === 'selected') {
      const preview = previewRange()
      if (preview) return preview[1]
      return tentativeEnd.value
    }
    if (mode.value === 'idle' && committedStart.value && committedEnd.value) {
      return committedEnd.value
    }
    return null
  })

  // --- Day info computation ---

  function computeDayInfo(date: Date, displayMonth: YearMonth): DayInfo {
    const rs = rangeStart.value
    const re = rangeEnd.value
    const dateTime = date.getTime()

    return {
      date,
      dayOfMonth: date.getDate(),
      isToday: isSameDay(date, today),
      isOutsideMonth:
        date.getFullYear() !== displayMonth.year || date.getMonth() + 1 !== displayMonth.month,
      isSelected:
        mode.value === 'selecting' && anchor.value !== null && isSameDay(date, anchor.value),
      isRangeStart: rs !== null && isSameDay(date, rs),
      isRangeEnd: re !== null && isSameDay(date, re),
      isInRange: rs !== null && re !== null && dateTime > rs.getTime() && dateTime < re.getTime(),
      isDisabled: false,
    }
  }

  function buildGrid(ym: YearMonth): MonthGrid {
    const rawGrid = generateMonthGrid(ym.year, ym.month)
    return rawGrid.map((week) => week.map((date) => computeDayInfo(date, ym)))
  }

  const leftGrid = computed<MonthGrid>(() => buildGrid(leftMonth.value))
  const rightGrid = computed<MonthGrid>(() => buildGrid(rightMonth.value))

  // --- "Voir la sélection" ---

  const showViewSelection = computed<boolean>(() => {
    let start: Date | null = null
    let end: Date | null = null
    if (mode.value === 'selected') {
      start = tentativeStart.value
      end = tentativeEnd.value
    } else if (mode.value === 'idle') {
      start = committedStart.value ?? null
      end = committedEnd.value ?? null
    }
    if (!start || !end) return false
    const startVisible = isSameMonth(start, leftMonth.value) || isSameMonth(start, rightMonth.value)
    const endVisible = isSameMonth(end, leftMonth.value) || isSameMonth(end, rightMonth.value)
    return !startVisible || !endVisible
  })

  // --- Month / Year pickers ---

  const monthPickerSide = ref<'left' | 'right' | null>(null)
  const yearPickerSide = ref<'left' | 'right' | null>(null)
  const yearPickerBaseYear = ref<number>(Math.floor(initialYm.year / 12) * 12)

  function openMonthPicker(side: 'left' | 'right') {
    if (monthPickerSide.value === side) {
      monthPickerSide.value = null
      return
    }
    yearPickerSide.value = null
    monthPickerSide.value = side
  }

  function openYearPicker(side: 'left' | 'right') {
    if (yearPickerSide.value === side) {
      yearPickerSide.value = null
      return
    }
    monthPickerSide.value = null
    const current = side === 'left' ? leftMonth.value : rightMonth.value
    yearPickerBaseYear.value = Math.floor(current.year / 12) * 12
    yearPickerSide.value = side
  }

  function applyYearMonth(side: 'left' | 'right', newYm: YearMonth) {
    if (side === 'left') {
      leftMonth.value = { ...newYm }
      if (compareYearMonth(newYm, rightMonth.value) >= 0) {
        rightMonth.value = nextMonth(newYm)
      }
    } else {
      rightMonth.value = { ...newYm }
      if (compareYearMonth(newYm, leftMonth.value) <= 0) {
        leftMonth.value = prevMonth(newYm)
      }
    }
  }

  function selectMonth(side: 'left' | 'right', month: number) {
    const current = side === 'left' ? leftMonth.value : rightMonth.value
    applyYearMonth(side, { year: current.year, month })
    monthPickerSide.value = null
  }

  function selectYear(side: 'left' | 'right', year: number) {
    const current = side === 'left' ? leftMonth.value : rightMonth.value
    applyYearMonth(side, { year, month: current.month })
    yearPickerSide.value = null
    monthPickerSide.value = side
  }

  // --- Actions ---

  function selectDay(date: Date) {
    if (mode.value === 'idle' || mode.value === 'selected') {
      // Transition to selecting
      anchor.value = date
      tentativeStart.value = null
      tentativeEnd.value = null
      mode.value = 'selecting'

      // Position calendars: anchor on left, next month on right
      const ym = yearMonthFromDate(date)
      leftMonth.value = { ...ym }
      rightMonth.value = nextMonth(ym)
    } else if (mode.value === 'selecting') {
      // Transition to selected
      const [start, end] = orderDates(anchor.value!, date)
      tentativeStart.value = start
      tentativeEnd.value = end
      committedStartSnapshot.value = committedStart.value
      committedEndSnapshot.value = committedEnd.value
      anchor.value = null
      mode.value = 'selected'
    }
  }

  function navigatePrev() {
    if (yearPickerSide.value !== null) {
      yearPickerBaseYear.value -= 12
      return
    }
    if (mode.value === 'idle' || mode.value === 'selected') {
      rightMonth.value = { ...leftMonth.value }
      leftMonth.value = prevMonth(leftMonth.value)
    } else if (mode.value === 'selecting' && anchor.value) {
      const candidateLeft = prevMonth(leftMonth.value)
      const candidateRight = prevMonth(rightMonth.value)

      const anchorInCandidateLeft = isSameMonth(anchor.value, candidateLeft)
      const anchorInCandidateRight = isSameMonth(anchor.value, candidateRight)

      if (anchorInCandidateLeft || anchorInCandidateRight) {
        leftMonth.value = candidateLeft
        rightMonth.value = candidateRight
      } else {
        // Pin the calendar that currently shows the anchor
        if (isSameMonth(anchor.value, rightMonth.value)) {
          // Pin right, move left back
          leftMonth.value = prevMonth(leftMonth.value)
        } else {
          // Pin left, move right back
          rightMonth.value = prevMonth(rightMonth.value)
        }
      }
    }
  }

  function navigateNext() {
    if (yearPickerSide.value !== null) {
      yearPickerBaseYear.value += 12
      return
    }
    if (mode.value === 'idle' || mode.value === 'selected') {
      leftMonth.value = { ...rightMonth.value }
      rightMonth.value = nextMonth(rightMonth.value)
    } else if (mode.value === 'selecting' && anchor.value) {
      const candidateLeft = nextMonth(leftMonth.value)
      const candidateRight = nextMonth(rightMonth.value)

      const anchorInCandidateLeft = isSameMonth(anchor.value, candidateLeft)
      const anchorInCandidateRight = isSameMonth(anchor.value, candidateRight)

      if (anchorInCandidateLeft || anchorInCandidateRight) {
        leftMonth.value = candidateLeft
        rightMonth.value = candidateRight
      } else {
        // Pin the calendar that currently shows the anchor
        if (isSameMonth(anchor.value, leftMonth.value)) {
          // Pin left, move right forward
          rightMonth.value = nextMonth(rightMonth.value)
        } else {
          // Pin right, move left forward
          leftMonth.value = nextMonth(leftMonth.value)
        }
      }
    }
  }

  function commit() {
    if (mode.value !== 'selected') return
    committedStart.value = tentativeStart.value ?? undefined
    committedEnd.value = tentativeEnd.value ?? undefined
    tentativeStart.value = null
    tentativeEnd.value = null
    mode.value = 'idle'
  }

  function reset() {
    if (mode.value !== 'selected') return
    committedStart.value = committedStartSnapshot.value
    committedEnd.value = committedEndSnapshot.value
    tentativeStart.value = null
    tentativeEnd.value = null
    mode.value = 'idle'
  }

  // --- Drag to adjust (selected mode only) ---

  function startDragEndpoint(endpoint: 'start' | 'end') {
    if (mode.value !== 'selected') return
    draggingKind.value = endpoint
    dragHoverDate.value = null
    dragAnchorDate.value = null

    const date = endpoint === 'start' ? tentativeStart.value : tentativeEnd.value
    if (date && isSameMonth(date, leftMonth.value)) {
      dragSourceSide.value = 'left'
    } else if (date && isSameMonth(date, rightMonth.value)) {
      dragSourceSide.value = 'right'
    } else {
      dragSourceSide.value = null
    }
  }

  function startDragRange(grabDate: Date) {
    if (mode.value !== 'selected') return
    if (!tentativeStart.value || !tentativeEnd.value) return
    const t = grabDate.getTime()
    if (t < tentativeStart.value.getTime() || t > tentativeEnd.value.getTime()) {
      return
    }
    draggingKind.value = 'range'
    dragAnchorDate.value = grabDate
    dragHoverDate.value = null
  }

  function updateDragHover(date: Date) {
    if (draggingKind.value === null) return
    dragHoverDate.value = date
  }

  function commitDrag() {
    if (draggingKind.value === null) return
    const preview = previewRange()
    if (preview) {
      tentativeStart.value = preview[0]
      tentativeEnd.value = preview[1]
    }
    draggingKind.value = null
    dragHoverDate.value = null
    dragAnchorDate.value = null
    dragSourceSide.value = null
  }

  function cancelDrag() {
    draggingKind.value = null
    dragHoverDate.value = null
    dragAnchorDate.value = null
    dragSourceSide.value = null
  }

  function pageSourcePrev() {
    if (dragSourceSide.value === 'left') {
      leftMonth.value = prevMonth(leftMonth.value)
    } else if (dragSourceSide.value === 'right') {
      const candidate = prevMonth(rightMonth.value)
      if (compareYearMonth(candidate, leftMonth.value) > 0) {
        rightMonth.value = candidate
      }
    }
  }

  function pageSourceNext() {
    if (dragSourceSide.value === 'left') {
      const candidate = nextMonth(leftMonth.value)
      if (compareYearMonth(candidate, rightMonth.value) < 0) {
        leftMonth.value = candidate
      }
    } else if (dragSourceSide.value === 'right') {
      rightMonth.value = nextMonth(rightMonth.value)
    }
  }

  function viewSelection() {
    let start: Date | null = null
    let end: Date | null = null
    if (mode.value === 'selected') {
      start = tentativeStart.value
      end = tentativeEnd.value
    } else if (mode.value === 'idle') {
      start = committedStart.value ?? null
      end = committedEnd.value ?? null
    }
    if (!start || !end) return

    const startYm = yearMonthFromDate(start)
    const endYm = yearMonthFromDate(end)

    if (startYm.year === endYm.year && startYm.month === endYm.month) {
      // Same month: left = that month, right = next
      leftMonth.value = { ...startYm }
      rightMonth.value = nextMonth(startYm)
    } else {
      leftMonth.value = { ...startYm }
      rightMonth.value = { ...endYm }
    }
  }

  function focusCommittedRange() {
    const cs = committedStart.value
    const ce = committedEnd.value
    if (!cs) return

    const startYm = yearMonthFromDate(cs)
    const endYm = ce ? yearMonthFromDate(ce) : null

    if (!endYm || compareYearMonth(startYm, endYm) === 0) {
      leftMonth.value = { ...startYm }
      rightMonth.value = nextMonth(startYm)
    } else {
      leftMonth.value = { ...startYm }
      rightMonth.value = { ...endYm }
    }
  }

  return {
    mode: computed(() => mode.value),
    leftMonth: computed(() => leftMonth.value),
    rightMonth: computed(() => rightMonth.value),
    leftGrid,
    rightGrid,
    showViewSelection,
    monthPickerSide: computed(() => monthPickerSide.value),
    yearPickerSide: computed(() => yearPickerSide.value),
    yearPickerBaseYear: computed(() => yearPickerBaseYear.value),
    selectDay,
    navigatePrev,
    navigateNext,
    commit,
    reset,
    viewSelection,
    focusCommittedRange,
    openMonthPicker,
    selectMonth,
    openYearPicker,
    selectYear,
    draggingKind: computed(() => draggingKind.value),
    dragSourceSide: computed(() => dragSourceSide.value),
    startDragEndpoint,
    startDragRange,
    updateDragHover,
    commitDrag,
    cancelDrag,
    pageSourcePrev,
    pageSourceNext,
  }
}
