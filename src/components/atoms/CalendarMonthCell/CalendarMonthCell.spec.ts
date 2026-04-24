import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarMonthCell from './CalendarMonthCell.vue'

const baseProps = {
  month: 4,
  label: 'avr.',
  isCurrent: false,
}

describe('CalendarMonthCell', () => {
  it('renders the label', () => {
    const w = mount(CalendarMonthCell, { props: baseProps })
    expect(w.text()).toBe('avr.')
  })

  it('emits click with month number when clicked', async () => {
    const w = mount(CalendarMonthCell, { props: baseProps })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    expect(w.emitted('click')![0]).toEqual([4])
  })

  it('applies current class when isCurrent is true', () => {
    const w = mount(CalendarMonthCell, {
      props: { ...baseProps, isCurrent: true },
    })
    expect(w.find('button').classes()).toContain('drp-month-cell--current')
  })

  it('does not apply current class when isCurrent is false', () => {
    const w = mount(CalendarMonthCell, { props: baseProps })
    expect(w.find('button').classes()).not.toContain('drp-month-cell--current')
  })
})
