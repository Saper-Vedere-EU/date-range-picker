import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarYearCell from './CalendarYearCell.vue'

const baseProps = { year: 2026, isCurrent: false }

describe('CalendarYearCell', () => {
  it('renders the year', () => {
    const w = mount(CalendarYearCell, { props: baseProps })
    expect(w.text()).toBe('2026')
  })

  it('emits click with the year number when clicked', async () => {
    const w = mount(CalendarYearCell, { props: baseProps })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    expect(w.emitted('click')![0]).toEqual([2026])
  })

  it('applies current class when isCurrent is true', () => {
    const w = mount(CalendarYearCell, {
      props: { ...baseProps, isCurrent: true },
    })
    expect(w.find('button').classes()).toContain('drp-year-cell--current')
  })

  it('does not apply current class when isCurrent is false', () => {
    const w = mount(CalendarYearCell, { props: baseProps })
    expect(w.find('button').classes()).not.toContain('drp-year-cell--current')
  })
})
