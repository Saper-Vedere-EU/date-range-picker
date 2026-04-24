import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import DateRangePicker from './DateRangePicker.vue'

type PickerWrapper = VueWrapper<InstanceType<typeof DateRangePicker>>

function getVisibleDayButtons(wrapper: PickerWrapper) {
  return wrapper.findAll('.drp-day').filter((btn) => !btn.classes().includes('drp-day--outside'))
}

describe('DateRangePicker', () => {
  it('renders two calendar months and navigation arrows', () => {
    const w = mount(DateRangePicker)
    expect(w.findAll('.drp-calendar-month')).toHaveLength(2)
    expect(w.findAll('.drp-nav-arrow')).toHaveLength(2)
  })

  it('does not show action bar initially', () => {
    const w = mount(DateRangePicker)
    expect(w.find('.drp-action-bar').exists()).toBe(false)
  })

  it('full flow: select range, validate, emits v-model', async () => {
    const w: PickerWrapper = mount(DateRangePicker, {
      props: {
        start: undefined,
        end: undefined,
        'onUpdate:start': (v: Date | undefined) => w.setProps({ start: v }),
        'onUpdate:end': (v: Date | undefined) => w.setProps({ end: v }),
      },
    })

    // Click first day (first visible day in left calendar)
    const days = getVisibleDayButtons(w)
    await days[0].trigger('click')

    // Should be in selecting mode (no action bar yet)
    expect(w.find('.drp-action-bar').exists()).toBe(false)

    // Click second day
    const days2 = getVisibleDayButtons(w)
    await days2[5].trigger('click')

    // Should be in selected mode with action bar
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').text()).toBe('Valider')

    // Click Valider
    await w.find('.drp-action-btn--primary').trigger('click')

    // Action bar should disappear (back to idle)
    expect(w.find('.drp-action-bar').exists()).toBe(false)

    // v-model should have been emitted
    expect(w.emitted('update:start')).toBeTruthy()
    expect(w.emitted('update:end')).toBeTruthy()
  })

  it('reset restores original values', async () => {
    const originalStart = new Date(2026, 3, 5)
    const originalEnd = new Date(2026, 3, 10)

    const w: PickerWrapper = mount(DateRangePicker, {
      props: {
        start: originalStart,
        end: originalEnd,
        'onUpdate:start': (v: Date | undefined) => w.setProps({ start: v }),
        'onUpdate:end': (v: Date | undefined) => w.setProps({ end: v }),
      },
    })

    // Click a day to enter selecting
    const days = getVisibleDayButtons(w)
    await days[15].trigger('click')

    // Click another to enter selected
    const days2 = getVisibleDayButtons(w)
    await days2[20].trigger('click')

    // Click Reset
    await w.find('.drp-action-btn--secondary').trigger('click')

    // Back to idle
    expect(w.find('.drp-action-bar').exists()).toBe(false)

    // Props should still be the originals (reset restores them,
    // but since they were never changed by selecting, no new emit is needed)
    expect(w.props('start')).toBe(originalStart)
    expect(w.props('end')).toBe(originalEnd)
  })

  it('navigation changes displayed months', async () => {
    const w = mount(DateRangePicker, {
      props: { start: new Date(2026, 3, 10) },
    })

    const headers = w.findAll('.drp-month-header')
    const initialLeft = headers[0].text()

    // Click next arrow
    await w.find('.drp-nav-arrow--right').trigger('click')

    const newHeaders = w.findAll('.drp-month-header')
    expect(newHeaders[0].text()).not.toBe(initialLeft)
  })

  it('applies custom messages to action bar and nav aria-labels', async () => {
    const w = mount(DateRangePicker, {
      props: {
        messages: {
          commit: 'Apply',
          reset: 'Cancel',
          prevMonth: 'Previous month',
          nextMonth: 'Next month',
        },
      },
    })

    expect(w.find('.drp-nav-arrow--left').attributes('aria-label')).toBe('Previous month')
    expect(w.find('.drp-nav-arrow--right').attributes('aria-label')).toBe('Next month')

    const days = getVisibleDayButtons(w)
    await days[0].trigger('click')
    const days2 = getVisibleDayButtons(w)
    await days2[5].trigger('click')

    expect(w.find('.drp-action-btn--primary').text()).toBe('Apply')
    expect(w.find('.drp-action-btn--secondary').text()).toBe('Cancel')
  })

  it('applies theme prop as inline CSS custom properties on the root', () => {
    const w = mount(DateRangePicker, {
      props: {
        theme: { accent: '#ff0000', bg: '#111', onAccent: '#eee' },
      },
    })

    const rootStyle = (w.find('.drp-date-range-picker').element as HTMLElement).style
    expect(rootStyle.getPropertyValue('--drp-accent')).toBe('#ff0000')
    expect(rootStyle.getPropertyValue('--drp-bg')).toBe('#111')
    expect(rootStyle.getPropertyValue('--drp-on-accent')).toBe('#eee')
    // Unspecified tokens should not be set inline (they fall back to the stylesheet default)
    expect(rootStyle.getPropertyValue('--drp-text')).toBe('')
  })

  it('omitting the theme prop leaves inline custom properties unset', () => {
    const w = mount(DateRangePicker)
    const rootStyle = (w.find('.drp-date-range-picker').element as HTMLElement).style
    expect(rootStyle.getPropertyValue('--drp-accent')).toBe('')
  })

  it('clicking a day in selected mode starts new selection', async () => {
    const w = mount(DateRangePicker)

    // Select two days
    const days1 = getVisibleDayButtons(w)
    await days1[2].trigger('click')
    const days2 = getVisibleDayButtons(w)
    await days2[8].trigger('click')

    // In selected mode
    expect(w.find('.drp-action-bar').exists()).toBe(true)

    // Click another day → back to selecting
    const days3 = getVisibleDayButtons(w)
    await days3[15].trigger('click')

    // Action bar should disappear
    expect(w.find('.drp-action-bar').exists()).toBe(false)
  })
})
