import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarNavigation from './CalendarNavigation.vue'
import type { MonthGrid } from '@/composables/useDateRangePicker/types'
import { generateMonthGrid } from '@/composables/useDateRangePicker/calendar-utils'

function makeGrid(year: number, month: number): MonthGrid {
  return generateMonthGrid(year, month).map((week) =>
    week.map((date) => ({
      date,
      dayOfMonth: date.getDate(),
      isToday: false,
      isOutsideMonth: date.getMonth() + 1 !== month || date.getFullYear() !== year,
      isSelected: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isDisabled: false,
    })),
  )
}

describe('CalendarNavigation', () => {
  const leftGrid = makeGrid(2026, 4)
  const rightGrid = makeGrid(2026, 5)

  const baseProps = {
    leftYear: 2026,
    leftMonth: 4,
    leftGrid,
    rightYear: 2026,
    rightMonth: 5,
    rightGrid,
    messages: { prevMonth: 'Mois précédent', nextMonth: 'Mois suivant' },
  }

  it('renders two calendar months', () => {
    const w = mount(CalendarNavigation, { props: baseProps })
    const months = w.findAll('.drp-calendar-month')
    expect(months).toHaveLength(2)
  })

  it('renders two navigation arrows', () => {
    const w = mount(CalendarNavigation, { props: baseProps })
    const arrows = w.findAll('.drp-nav-arrow')
    expect(arrows).toHaveLength(2)
  })

  it('emits prev when left arrow is clicked', async () => {
    const w = mount(CalendarNavigation, { props: baseProps })
    const leftArrow = w.find('.drp-nav-arrow--left')
    await leftArrow.trigger('click')
    expect(w.emitted('prev')).toHaveLength(1)
  })

  it('emits next when right arrow is clicked', async () => {
    const w = mount(CalendarNavigation, { props: baseProps })
    const rightArrow = w.find('.drp-nav-arrow--right')
    await rightArrow.trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
  })

  it('emits select-day when a day is clicked', async () => {
    const w = mount(CalendarNavigation, { props: baseProps })
    const dayButtons = w.findAll('.drp-day')
    await dayButtons[5].trigger('click')
    expect(w.emitted('select-day')).toHaveLength(1)
  })
})
