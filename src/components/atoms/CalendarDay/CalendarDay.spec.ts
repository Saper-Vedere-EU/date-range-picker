import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarDay from './CalendarDay.vue'

const baseProps = {
  day: 15,
  isToday: false,
  isOutsideMonth: false,
  isSelected: false,
  isRangeStart: false,
  isRangeEnd: false,
  isInRange: false,
  isDisabled: false,
}

describe('CalendarDay', () => {
  it('renders the day number', () => {
    const w = mount(CalendarDay, { props: baseProps })
    expect(w.text()).toBe('15')
  })

  it('emits click when clicked', async () => {
    const w = mount(CalendarDay, { props: baseProps })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isDisabled: true },
    })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })

  it('applies today class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isToday: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--today')
  })

  it('applies outside-month class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isOutsideMonth: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--outside')
  })

  it('applies selected class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isSelected: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--selected')
  })

  it('applies range-start class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isRangeStart: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--range-start')
  })

  it('applies range-end class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isRangeEnd: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--range-end')
  })

  it('applies in-range class', () => {
    const w = mount(CalendarDay, {
      props: { ...baseProps, isInRange: true },
    })
    expect(w.find('button').classes()).toContain('drp-day--in-range')
  })
})
