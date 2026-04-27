import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useDateRangePicker } from './useDateRangePicker'

function setup(start?: Date, end?: Date) {
  const committedStart = ref<Date | undefined>(start)
  const committedEnd = ref<Date | undefined>(end)
  const picker = useDateRangePicker({ committedStart, committedEnd })
  return { picker, committedStart, committedEnd }
}

describe('useDateRangePicker', () => {
  describe('initial state', () => {
    it('starts in idle mode', () => {
      const { picker } = setup()
      expect(picker.mode.value).toBe('idle')
    })

    it('initializes left calendar to committed start month', () => {
      const { picker } = setup(new Date(2026, 2, 5)) // March 2026
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 })
    })

    it('shows committed range in idle mode', () => {
      const { picker } = setup(new Date(2026, 2, 5), new Date(2026, 2, 15))
      const allDays = picker.leftGrid.value.flat()
      const rangeStart = allDays.find((d) => d.isRangeStart)
      const rangeEnd = allDays.find((d) => d.isRangeEnd)
      const inRange = allDays.filter((d) => d.isInRange)

      expect(rangeStart?.dayOfMonth).toBe(5)
      expect(rangeEnd?.dayOfMonth).toBe(15)
      expect(inRange.length).toBe(9) // 6,7,8,9,10,11,12,13,14
    })
  })

  describe('idle → selecting', () => {
    it('transitions to selecting on day click', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10)) // April 10

      expect(picker.mode.value).toBe('selecting')
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
    })

    it('marks the anchor day as selected in the grid', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))

      const allDays = picker.leftGrid.value.flat()
      const selected = allDays.filter((d) => d.isSelected)
      expect(selected).toHaveLength(1)
      expect(selected[0].dayOfMonth).toBe(10)
    })
  })

  describe('selecting → selected', () => {
    it('transitions to selected on second day click', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))

      expect(picker.mode.value).toBe('selected')
    })

    it('orders dates chronologically', () => {
      const { picker } = setup()
      // Click later date first, then earlier
      picker.selectDay(new Date(2026, 3, 20))
      picker.selectDay(new Date(2026, 3, 5))

      expect(picker.mode.value).toBe('selected')
      const allDays = picker.leftGrid.value.flat()
      const rangeStart = allDays.find((d) => d.isRangeStart)
      const rangeEnd = allDays.find((d) => d.isRangeEnd)
      expect(rangeStart?.dayOfMonth).toBe(5)
      expect(rangeEnd?.dayOfMonth).toBe(20)
    })

    it('shows the full range highlight', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 15))

      const allDays = picker.leftGrid.value.flat()
      const inRange = allDays.filter((d) => d.isInRange)
      expect(inRange.length).toBe(4) // 11, 12, 13, 14
    })
  })

  describe('selected → idle (commit)', () => {
    it('updates committed values on commit', () => {
      const { picker, committedStart, committedEnd } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))
      picker.commit()

      expect(picker.mode.value).toBe('idle')
      expect(committedStart.value?.getDate()).toBe(10)
      expect(committedEnd.value?.getDate()).toBe(20)
    })
  })

  describe('selected → idle (reset)', () => {
    it('restores original committed values on reset', () => {
      const originalStart = new Date(2026, 2, 1)
      const originalEnd = new Date(2026, 2, 10)
      const { picker, committedStart, committedEnd } = setup(originalStart, originalEnd)

      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))
      picker.reset()

      expect(picker.mode.value).toBe('idle')
      expect(committedStart.value).toBe(originalStart)
      expect(committedEnd.value).toBe(originalEnd)
    })
  })

  describe('selected → selecting', () => {
    it('clears range and sets new anchor on day click', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))
      expect(picker.mode.value).toBe('selected')

      picker.selectDay(new Date(2026, 4, 5)) // May 5
      expect(picker.mode.value).toBe('selecting')

      const allDays = picker.leftGrid.value.flat()
      const selected = allDays.filter((d) => d.isSelected)
      expect(selected).toHaveLength(1)
      expect(selected[0].dayOfMonth).toBe(5)

      const inRange = allDays.filter((d) => d.isInRange)
      expect(inRange).toHaveLength(0)
    })
  })

  describe('navigation in idle', () => {
    it('moves both calendars back together', () => {
      const { picker } = setup(new Date(2026, 3, 10))
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })

      picker.navigatePrev()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 })
    })

    it('moves both calendars forward together', () => {
      const { picker } = setup(new Date(2026, 3, 10))
      picker.navigateNext()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 5 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 })
    })
  })

  describe('navigation in selecting (pinning)', () => {
    it('moves both when anchor stays visible', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 5)) // March 5
      // left=March, right=April
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })

      picker.navigatePrev()
      // left=Feb, right=March (anchor March 5 still visible in right)
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 2 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 })
    })

    it('pins right calendar when navigating prev would hide anchor', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 5)) // March 5
      // left=March, right=April

      // First prev: left=Feb, right=March (anchor visible in right)
      picker.navigatePrev()
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 })

      // Second prev: anchor is in right(March), candidate right=Feb would hide it
      // So pin right(March), only left moves to Jan
      picker.navigatePrev()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 1 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 })
    })

    it('pins left calendar when navigating next would hide anchor', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 5)) // March 5
      // left=March, right=April

      // First next: left=April, right=May → anchor not visible in either candidate
      // Anchor is in left(March), so pin left, move right to May
      picker.navigateNext()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
    })

    it('allows navigating next after pinning', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 5)) // March 5
      // left=March, right=April

      picker.navigateNext() // left=March(pinned), right=May
      picker.navigateNext() // left=March(pinned), right=June
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 })
    })
  })

  describe('navigation in selected', () => {
    it('allows free navigation', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))

      picker.navigateNext()
      picker.navigateNext()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 6 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 7 })
    })
  })

  describe('navigation snaps back to consecutive months', () => {
    it('next arrow: left becomes previous right, right advances (idle, non-consecutive)', () => {
      const { picker } = setup(new Date(2026, 2, 10)) // left=March, right=April
      picker.selectMonth('right', 10) // left=March, right=October
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 10 })

      picker.navigateNext()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 10 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 11 })
    })

    it('prev arrow: right becomes previous left, left goes back (idle, non-consecutive)', () => {
      const { picker } = setup(new Date(2026, 2, 10)) // left=March, right=April
      picker.selectMonth('right', 10) // left=March, right=October
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 10 })

      picker.navigatePrev()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 2 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 })
    })

    it('works the same in selected mode (next)', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 10))
      picker.selectDay(new Date(2026, 2, 20))
      // selected, left=March, right=April
      picker.selectMonth('right', 10) // left=March, right=October

      picker.navigateNext()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 10 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 11 })
    })

    it('works the same in selected mode (prev)', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 2, 10))
      picker.selectDay(new Date(2026, 2, 20))
      picker.selectMonth('right', 10) // left=March, right=October

      picker.navigatePrev()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 2 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 })
    })
  })

  describe('showViewSelection', () => {
    it('is false in idle mode without a committed range', () => {
      const { picker } = setup()
      expect(picker.showViewSelection.value).toBe(false)
    })

    it('is false in selecting mode', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      expect(picker.showViewSelection.value).toBe(false)
    })

    it('is false when range is visible', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))
      // Both dates are in April, which is in leftMonth
      expect(picker.showViewSelection.value).toBe(false)
    })

    it('is true in selected mode when range is not visible after navigation', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))

      // Navigate far away
      picker.navigateNext()
      picker.navigateNext()
      picker.navigateNext()
      expect(picker.showViewSelection.value).toBe(true)
    })

    it('is true in idle mode when committed range is not visible', () => {
      const { picker } = setup(new Date(2026, 3, 10), new Date(2026, 3, 20))
      // Committed range in April; navigate far away to hide it
      picker.navigateNext()
      picker.navigateNext()
      picker.navigateNext()
      expect(picker.mode.value).toBe('idle')
      expect(picker.showViewSelection.value).toBe(true)
    })
  })

  describe('viewSelection', () => {
    it('repositions calendars to show the selection', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 4, 20)) // May 20

      // Navigate far away
      picker.navigateNext()
      picker.navigateNext()
      picker.navigateNext()

      picker.viewSelection()
      // start=April, end=May → left=April, right=May
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
    })

    it('handles same-month range', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20))

      picker.navigateNext()
      picker.navigateNext()
      picker.navigateNext()

      picker.viewSelection()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
    })

    it('refocuses the committed range from idle mode', () => {
      const { picker } = setup(new Date(2026, 3, 10), new Date(2026, 4, 20))
      picker.navigateNext()
      picker.navigateNext()
      picker.navigateNext()
      expect(picker.mode.value).toBe('idle')

      picker.viewSelection()
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
    })
  })

  describe('month picker', () => {
    it('starts with no month picker open', () => {
      const { picker } = setup()
      expect(picker.monthPickerSide.value).toBeNull()
    })

    it('opens month picker for left side', () => {
      const { picker } = setup()
      picker.openMonthPicker('left')
      expect(picker.monthPickerSide.value).toBe('left')
    })

    it('opens month picker for right side', () => {
      const { picker } = setup()
      picker.openMonthPicker('right')
      expect(picker.monthPickerSide.value).toBe('right')
    })

    it('toggles month picker off when clicking same side', () => {
      const { picker } = setup()
      picker.openMonthPicker('left')
      picker.openMonthPicker('left')
      expect(picker.monthPickerSide.value).toBeNull()
    })

    it('switches sides when clicking the other side', () => {
      const { picker } = setup()
      picker.openMonthPicker('left')
      picker.openMonthPicker('right')
      expect(picker.monthPickerSide.value).toBe('right')
    })

    it('selects a month on the left without conflict', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.openMonthPicker('left')
      picker.selectMonth('left', 3) // March
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 }) // unchanged
      expect(picker.monthPickerSide.value).toBeNull()
    })

    it('adjusts right when left month >= right month', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('left', 5) // May — same as right
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 5 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 }) // pushed to June
    })

    it('adjusts right when left month > right month', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('left', 10) // October — after right
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 10 })
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 11 }) // pushed to November
    })

    it('selects a month on the right without conflict', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('right', 8) // August
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 8 })
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 }) // unchanged
    })

    it('adjusts left when right month <= left month', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('right', 4) // April — same as left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 })
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 }) // pushed to March
    })

    it('adjusts left when right month < left month', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('right', 2) // February — before left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 2 })
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 1 }) // pushed to January
    })

    it('handles December wrap when adjusting right', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April, right=May
      picker.selectMonth('left', 12) // December
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 12 })
      expect(picker.rightMonth.value).toEqual({ year: 2027, month: 1 }) // January next year
    })

    it('handles January wrap when adjusting left', () => {
      const { picker } = setup(new Date(2026, 0, 10)) // left=January, right=February
      picker.selectMonth('right', 1) // January — same as left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 1 })
      expect(picker.leftMonth.value).toEqual({ year: 2025, month: 12 }) // December prev year
    })

    it('works in selecting mode', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10)) // enter selecting mode
      expect(picker.mode.value).toBe('selecting')

      picker.selectMonth('left', 8)
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 8 })
    })

    it('works in selected mode', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 20)) // enter selected mode
      expect(picker.mode.value).toBe('selected')

      picker.selectMonth('right', 10)
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 10 })
    })
  })

  describe('year picker', () => {
    it('starts with no year picker open', () => {
      const { picker } = setup()
      expect(picker.yearPickerSide.value).toBeNull()
    })

    it('opens year picker for a side and seeds the decade window', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April 2026
      picker.openYearPicker('left')
      expect(picker.yearPickerSide.value).toBe('left')
      // Math.floor(2026 / 12) * 12 = 2016
      expect(picker.yearPickerBaseYear.value).toBe(2016)
    })

    it('toggles year picker off when clicking same side', () => {
      const { picker } = setup()
      picker.openYearPicker('left')
      picker.openYearPicker('left')
      expect(picker.yearPickerSide.value).toBeNull()
    })

    it('closes month picker when opening year picker', () => {
      const { picker } = setup()
      picker.openMonthPicker('left')
      expect(picker.monthPickerSide.value).toBe('left')

      picker.openYearPicker('left')
      expect(picker.monthPickerSide.value).toBeNull()
      expect(picker.yearPickerSide.value).toBe('left')
    })

    it('closes year picker when opening month picker', () => {
      const { picker } = setup()
      picker.openYearPicker('left')
      expect(picker.yearPickerSide.value).toBe('left')

      picker.openMonthPicker('left')
      expect(picker.yearPickerSide.value).toBeNull()
      expect(picker.monthPickerSide.value).toBe('left')
    })

    it('arrows shift the decade window by 12 years when year picker is open', () => {
      const { picker } = setup(new Date(2026, 3, 10))
      picker.openYearPicker('left')
      expect(picker.yearPickerBaseYear.value).toBe(2016)

      picker.navigateNext()
      expect(picker.yearPickerBaseYear.value).toBe(2028)
      // Calendars themselves don't move
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })

      picker.navigatePrev()
      picker.navigatePrev()
      expect(picker.yearPickerBaseYear.value).toBe(2004)
    })

    it('selectYear updates the year, closes year picker, opens month picker', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April 2026
      picker.openYearPicker('left')
      picker.selectYear('left', 2030)

      expect(picker.leftMonth.value).toEqual({ year: 2030, month: 4 })
      expect(picker.yearPickerSide.value).toBeNull()
      expect(picker.monthPickerSide.value).toBe('left')
    })

    it('selectYear on left pushes right when left >= right', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April 2026, right=May 2026
      picker.selectYear('left', 2027) // left now April 2027, after right
      expect(picker.leftMonth.value).toEqual({ year: 2027, month: 4 })
      expect(picker.rightMonth.value).toEqual({ year: 2027, month: 5 })
    })

    it('selectYear on right pushes left when right <= left', () => {
      const { picker } = setup(new Date(2026, 3, 10)) // left=April 2026, right=May 2026
      picker.selectYear('right', 2025) // right now May 2025, before left
      expect(picker.rightMonth.value).toEqual({ year: 2025, month: 5 })
      expect(picker.leftMonth.value).toEqual({ year: 2025, month: 4 })
    })
  })

  describe('drag to adjust endpoint', () => {
    function setupSelected() {
      const ctx = setup()
      ctx.picker.selectDay(new Date(2026, 3, 10)) // April 10
      ctx.picker.selectDay(new Date(2026, 3, 20)) // April 20
      return ctx
    }

    function currentRange(picker: ReturnType<typeof useDateRangePicker>) {
      const days = [...picker.leftGrid.value.flat(), ...picker.rightGrid.value.flat()]
      const rs = days.find((d) => d.isRangeStart && !d.isOutsideMonth)
      const re = days.find((d) => d.isRangeEnd && !d.isOutsideMonth)
      return { start: rs?.dayOfMonth, end: re?.dayOfMonth }
    }

    it('is inactive outside selected mode', () => {
      const { picker } = setup()
      picker.startDragEndpoint('start')
      expect(picker.draggingKind.value).toBeNull()

      picker.selectDay(new Date(2026, 3, 10)) // selecting
      picker.startDragEndpoint('start')
      expect(picker.draggingKind.value).toBeNull()
    })

    it('activates drag in selected mode', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('start')
      expect(picker.draggingKind.value).toBe('start')
    })

    it('updates range preview live on hover', () => {
      const { picker } = setupSelected()
      expect(currentRange(picker)).toEqual({ start: 10, end: 20 })

      picker.startDragEndpoint('start')
      picker.updateDragHover(new Date(2026, 3, 5)) // move start to 5
      expect(currentRange(picker)).toEqual({ start: 5, end: 20 })
    })

    it('keeps the other endpoint fixed while dragging', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('end')
      picker.updateDragHover(new Date(2026, 3, 25))
      expect(currentRange(picker)).toEqual({ start: 10, end: 25 })
    })

    it('swaps endpoints when drag crosses the other boundary', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('start')
      // Drag start past the end date
      picker.updateDragHover(new Date(2026, 3, 25))
      expect(currentRange(picker)).toEqual({ start: 20, end: 25 })
    })

    it('commits the previewed range on drop', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('end')
      picker.updateDragHover(new Date(2026, 3, 15))
      picker.commitDrag()

      expect(currentRange(picker)).toEqual({ start: 10, end: 15 })
      expect(picker.draggingKind.value).toBeNull()
    })

    it('cancelDrag reverts the preview to the last committed range', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('start')
      picker.updateDragHover(new Date(2026, 3, 1))
      expect(currentRange(picker)).toEqual({ start: 1, end: 20 })

      picker.cancelDrag()
      expect(currentRange(picker)).toEqual({ start: 10, end: 20 })
      expect(picker.draggingKind.value).toBeNull()
    })

    it('cancelDrag without hover is a no-op on the range', () => {
      const { picker } = setupSelected()
      picker.startDragEndpoint('start')
      picker.cancelDrag()
      expect(currentRange(picker)).toEqual({ start: 10, end: 20 })
    })

    it('commit after drag persists the adjusted range', () => {
      const { picker, committedStart, committedEnd } = setupSelected()
      picker.startDragEndpoint('end')
      picker.updateDragHover(new Date(2026, 3, 25))
      picker.commitDrag()
      picker.commit()

      expect(committedStart.value?.getDate()).toBe(10)
      expect(committedEnd.value?.getDate()).toBe(25)
    })

    describe('drag source side and auto-paging', () => {
      it("sets dragSourceSide to 'left' when the grabbed boundary is on left calendar", () => {
        const ctx = setup()
        ctx.picker.selectDay(new Date(2026, 3, 10)) // left=April, right=May
        ctx.picker.selectDay(new Date(2026, 3, 20))
        ctx.picker.startDragEndpoint('start') // start = April 10 → left
        expect(ctx.picker.dragSourceSide.value).toBe('left')
      })

      it("sets dragSourceSide to 'right' when the grabbed boundary is on right calendar", () => {
        const ctx = setup()
        ctx.picker.selectDay(new Date(2026, 3, 10)) // left=April, right=May
        ctx.picker.selectDay(new Date(2026, 4, 15)) // end = May 15
        ctx.picker.startDragEndpoint('end')
        expect(ctx.picker.dragSourceSide.value).toBe('right')
      })

      it('resets dragSourceSide on commit and cancel', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10))
        picker.selectDay(new Date(2026, 3, 20))

        picker.startDragEndpoint('start')
        picker.commitDrag()
        expect(picker.dragSourceSide.value).toBeNull()

        picker.startDragEndpoint('start')
        picker.cancelDrag()
        expect(picker.dragSourceSide.value).toBeNull()
      })

      it('pageSourcePrev on left always advances left back a month', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10))
        picker.selectDay(new Date(2026, 3, 20))
        picker.startDragEndpoint('start') // source=left

        picker.pageSourcePrev()
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
      })

      it('pageSourceNext on left is blocked in consecutive state (would collide)', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10)) // left=April, right=May
        picker.selectDay(new Date(2026, 3, 20))
        picker.startDragEndpoint('start')

        picker.pageSourceNext()
        // consecutive April/May → next would make left=May === right, blocked
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
      })

      it('pageSourceNext on left advances when non-consecutive', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10)) // left=April, right=May
        picker.selectDay(new Date(2026, 3, 20))
        // Break consecutive: shift right forward
        picker.selectMonth('right', 7) // right=July
        picker.startDragEndpoint('start') // source=left (April)

        picker.pageSourceNext()
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 5 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 7 })
      })

      it('pageSourcePrev on right is blocked in consecutive state', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10)) // left=April, right=May
        picker.selectDay(new Date(2026, 4, 10)) // end on May → source=right
        picker.startDragEndpoint('end')

        picker.pageSourcePrev()
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 })
      })

      it('pageSourcePrev on right advances when non-consecutive', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10))
        picker.selectDay(new Date(2026, 4, 10)) // end May → source=right
        picker.selectMonth('left', 2) // left=Feb, right=May
        picker.startDragEndpoint('end')

        picker.pageSourcePrev()
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 2 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 })
      })

      it('pageSourceNext on right always advances right forward', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10))
        picker.selectDay(new Date(2026, 4, 10)) // end May
        picker.startDragEndpoint('end')

        picker.pageSourceNext()
        expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 })
        expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 })
      })

      it('page methods are no-ops when there is no drag source', () => {
        const { picker } = setup()
        picker.selectDay(new Date(2026, 3, 10))
        picker.selectDay(new Date(2026, 3, 20))
        // No startDragEndpoint → dragSourceSide is null
        const leftBefore = { ...picker.leftMonth.value }
        const rightBefore = { ...picker.rightMonth.value }

        picker.pageSourcePrev()
        picker.pageSourceNext()

        expect(picker.leftMonth.value).toEqual(leftBefore)
        expect(picker.rightMonth.value).toEqual(rightBefore)
      })
    })

    describe('range drag (rigid translation)', () => {
      function setupLongRange() {
        const ctx = setup()
        ctx.picker.selectDay(new Date(2026, 2, 15)) // March 15
        ctx.picker.selectDay(new Date(2026, 3, 15)) // April 15
        return ctx
      }

      it('activates range drag when grabbing an in-range day', () => {
        const { picker } = setupLongRange()
        picker.startDragRange(new Date(2026, 2, 26)) // March 26 (in range)
        expect(picker.draggingKind.value).toBe('range')
      })

      it('ignores startDragRange when the grab date is outside the range', () => {
        const { picker } = setupLongRange()
        picker.startDragRange(new Date(2026, 4, 5)) // May 5, after end
        expect(picker.draggingKind.value).toBeNull()
      })

      it('ignores startDragRange outside selected mode', () => {
        const { picker } = setup()
        picker.startDragRange(new Date(2026, 2, 26))
        expect(picker.draggingKind.value).toBeNull()
      })

      it('translates both endpoints by the hover delta', () => {
        const { picker } = setupLongRange() // March 15 → April 15
        picker.startDragRange(new Date(2026, 2, 26)) // grab March 26
        picker.updateDragHover(new Date(2026, 3, 5)) // drop target April 5 → +10 days

        // left calendar = March, right = April
        const left = picker.leftGrid.value.flat()
        const right = picker.rightGrid.value.flat()
        const rsLeft = left.find((d) => d.isRangeStart && !d.isOutsideMonth)
        const reRight = right.find((d) => d.isRangeEnd && !d.isOutsideMonth)
        // new start = March 15 + 10 = March 25
        expect(rsLeft?.dayOfMonth).toBe(25)
        // new end = April 15 + 10 = April 25
        expect(reRight?.dayOfMonth).toBe(25)
      })

      it('translates backward with a negative delta', () => {
        const { picker } = setupLongRange()
        picker.startDragRange(new Date(2026, 2, 26)) // March 26
        picker.updateDragHover(new Date(2026, 2, 20)) // March 20 → -6 days

        const left = picker.leftGrid.value.flat()
        const right = picker.rightGrid.value.flat()
        const rsLeft = left.find((d) => d.isRangeStart && !d.isOutsideMonth)
        const reRight = right.find((d) => d.isRangeEnd && !d.isOutsideMonth)
        // start = March 9, end = April 9
        expect(rsLeft?.dayOfMonth).toBe(9)
        expect(reRight?.dayOfMonth).toBe(9)
      })

      it('commits the translated range on drop', () => {
        const { picker } = setupLongRange()
        picker.startDragRange(new Date(2026, 2, 26))
        picker.updateDragHover(new Date(2026, 3, 5)) // +10 days
        picker.commitDrag()

        const left = picker.leftGrid.value.flat()
        const right = picker.rightGrid.value.flat()
        expect(left.find((d) => d.isRangeStart && !d.isOutsideMonth)?.dayOfMonth).toBe(25)
        expect(right.find((d) => d.isRangeEnd && !d.isOutsideMonth)?.dayOfMonth).toBe(25)
        expect(picker.draggingKind.value).toBeNull()
      })

      it('cancelDrag reverts to the committed range', () => {
        const { picker } = setupLongRange()
        picker.startDragRange(new Date(2026, 2, 26))
        picker.updateDragHover(new Date(2026, 3, 5))
        picker.cancelDrag()

        const left = picker.leftGrid.value.flat()
        expect(left.find((d) => d.isRangeStart && !d.isOutsideMonth)?.dayOfMonth).toBe(15)
        expect(picker.draggingKind.value).toBeNull()
      })
    })
  })

  describe('edge cases', () => {
    it('handles range spanning year boundary', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 11, 25)) // Dec 25
      picker.selectDay(new Date(2027, 0, 5)) // Jan 5

      expect(picker.mode.value).toBe('selected')

      const leftDays = picker.leftGrid.value.flat()
      const rightDays = picker.rightGrid.value.flat()
      const allDays = [...leftDays, ...rightDays]
      const rangeStart = allDays.find((d) => d.isRangeStart)
      const rangeEnd = allDays.find((d) => d.isRangeEnd)
      expect(rangeStart?.dayOfMonth).toBe(25)
      expect(rangeEnd?.dayOfMonth).toBe(5)
    })

    it('handles selecting same day twice', () => {
      const { picker } = setup()
      picker.selectDay(new Date(2026, 3, 10))
      picker.selectDay(new Date(2026, 3, 10))

      expect(picker.mode.value).toBe('selected')
      const allDays = picker.leftGrid.value.flat()
      const day10 = allDays.find((d) => d.dayOfMonth === 10 && !d.isOutsideMonth)
      expect(day10?.isRangeStart).toBe(true)
      expect(day10?.isRangeEnd).toBe(true)
    })
  })
})
