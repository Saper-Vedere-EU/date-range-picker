import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalendarMonthHeader from './CalendarMonthHeader.vue'

describe('CalendarMonthHeader', () => {
  it('renders month name and year in French', () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4 },
    })
    expect(w.text().toLowerCase()).toContain('avril')
    expect(w.text()).toContain('2026')
  })

  it('renders in English when locale is en-US', () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4, locale: 'en-US' },
    })
    expect(w.text().toLowerCase()).toContain('april')
    expect(w.text()).toContain('2026')
  })

  it('capitalizes the first letter of the month name', () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 1 },
    })
    const monthText = w.find('.drp-month-header__btn--month').text()
    expect(monthText[0]).toBe(monthText[0].toUpperCase())
  })

  it('emits click-month when the month button is clicked', async () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4 },
    })
    await w.find('.drp-month-header__btn--month').trigger('click')
    expect(w.emitted('click-month')).toHaveLength(1)
    expect(w.emitted('click-year')).toBeUndefined()
  })

  it('emits click-year when the year button is clicked', async () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4 },
    })
    await w.find('.drp-month-header__btn--year').trigger('click')
    expect(w.emitted('click-year')).toHaveLength(1)
    expect(w.emitted('click-month')).toBeUndefined()
  })

  it('renders month and year as separate buttons', () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4 },
    })
    expect(w.findAll('button')).toHaveLength(2)
  })
})
