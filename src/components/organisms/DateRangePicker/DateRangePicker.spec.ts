import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
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

  it('shows action bar with disabled buttons initially', () => {
    const w = mount(DateRangePicker)
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeDefined()
    expect(w.find('.drp-action-btn--secondary').attributes('disabled')).toBeDefined()
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

    // In selecting mode: action bar visible but commit is disabled
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeDefined()

    // Click second day
    const days2 = getVisibleDayButtons(w)
    await days2[5].trigger('click')

    // Should be in selected mode with commit enabled
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeUndefined()
    expect(w.find('.drp-action-btn--primary').text()).toBe('Valider')

    // Click Valider
    await w.find('.drp-action-btn--primary').trigger('click')

    // Back to idle: action bar still visible but disabled
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeDefined()

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

    // Back to idle: action bar stays visible but buttons are disabled
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--secondary').attributes('disabled')).toBeDefined()

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

  describe('mode="input"', () => {
    const mountedWrappers: VueWrapper[] = []
    afterEach(() => {
      while (mountedWrappers.length) mountedWrappers.pop()?.unmount()
    })
    function mountInput(props: Record<string, unknown> = {}) {
      const w = mount(DateRangePicker, {
        props: { mode: 'input', ...props },
        attachTo: document.body,
      })
      mountedWrappers.push(w)
      return w
    }

    it('renders a text input instead of the inline calendar', () => {
      const w = mountInput()
      expect(w.find('input.drp-input').exists()).toBe(true)
      expect(w.find('.drp-calendar-month').exists()).toBe(false)
    })

    it('opens the popover on input focus', async () => {
      const w = mountInput()
      await w.find('input').trigger('focus')
      await nextTick()
      expect(document.body.querySelector('.drp-popover')).not.toBeNull()
      expect(document.body.querySelector('.drp-calendar-month')).not.toBeNull()
    })

    it('initializes the popover with the v-model range', async () => {
      const w = mountInput({ start: new Date(2026, 3, 5), end: new Date(2026, 3, 15) })
      expect((w.find('input').element as HTMLInputElement).value).toBe('05/04/2026 - 15/04/2026')
      await w.find('input').trigger('focus')
      await nextTick()
      // Once opened, the calendar renders the range — selected-start & range-end cells exist
      expect(document.body.querySelector('.drp-day--range-start')).not.toBeNull()
      expect(document.body.querySelector('.drp-day--range-end')).not.toBeNull()
    })

    it('reopens the popover focused on the committed range after navigating away', async () => {
      const start = new Date(2026, 3, 5)
      const end = new Date(2026, 3, 15)
      const w = mountInput({ start, end })

      await w.find('input').trigger('focus')
      await nextTick()
      expect(document.body.querySelector('.drp-day--range-start')).not.toBeNull()

      // Navigate away — left calendar moves forward
      const nextArrow = document.body.querySelector<HTMLElement>('.drp-nav-arrow--right')
      nextArrow!.click()
      nextArrow!.click()
      await nextTick()
      // Range no longer visible
      expect(document.body.querySelector('.drp-day--range-start')).toBeNull()

      // Close and reopen
      await w.find('input').trigger('blur')
      await nextTick()
      // Click outside-style close: just trigger focus again to reopen
      await w.find('input').trigger('focus')
      await nextTick()

      // Calendars should be back on the committed range
      expect(document.body.querySelector('.drp-day--range-start')).not.toBeNull()
      expect(document.body.querySelector('.drp-day--range-end')).not.toBeNull()
    })

    it('typing a complete valid range updates v-model', async () => {
      const w = mountInput({ start: undefined, end: undefined })
      const input = w.find('input')
      await input.setValue('15/04/2026 - 20/04/2026')

      const startEvents = w.emitted('update:start')
      const endEvents = w.emitted('update:end')
      expect(startEvents).toBeTruthy()
      expect(endEvents).toBeTruthy()
      expect((startEvents![0][0] as Date).getTime()).toBe(new Date(2026, 3, 15).getTime())
    })

    it('forwards the input slot, replacing the default input', async () => {
      const w = mountInput({
        start: new Date(2026, 3, 5),
        end: new Date(2026, 3, 15),
      })
      // Re-mount with slot — mountInput doesn't accept slots, so build directly:
      w.unmount()

      const direct = mount(DateRangePicker, {
        props: {
          mode: 'input',
          start: new Date(2026, 3, 5),
          end: new Date(2026, 3, 15),
        },
        slots: {
          input: `<template #input="b">
            <input class="my-custom-input" :value="b.value" @input="b.onValueChange($event.target.value)" @focus="b.onFocus" />
          </template>`,
        } as never,
        attachTo: document.body,
      })
      mountedWrappers.push(direct)

      expect(direct.find('input.drp-input').exists()).toBe(false)
      expect(direct.find('input.my-custom-input').exists()).toBe(true)
      expect((direct.find('input.my-custom-input').element as HTMLInputElement).value).toBe(
        '05/04/2026 - 15/04/2026',
      )

      await direct.find('input.my-custom-input').trigger('focus')
      await nextTick()
      expect(document.body.querySelector('.drp-popover')).not.toBeNull()
    })

    it('forwards the popover slot, replacing the built-in popover', async () => {
      const direct = mount(DateRangePicker, {
        props: { mode: 'input' },
        slots: {
          popover: `<template #popover="p">
            <div v-if="p.open" class="custom-popover" @click="p.onClose">
              <DateRangePickerPanel />
            </div>
          </template>`,
        } as never,
        global: {
          components: {
            // Re-export of the panel — the consumer would import it from the package.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            DateRangePickerPanel: (
              await import('@/components/organisms/DateRangePickerPanel')
            ).DateRangePickerPanel,
          },
        },
        attachTo: document.body,
      })
      mountedWrappers.push(direct)

      // Built-in popover is not rendered when the slot is provided.
      expect(document.body.querySelector('.drp-popover')).toBeNull()
      expect(direct.find('.custom-popover').exists()).toBe(false)

      // Focus opens the slot's popover with the panel inside.
      await direct.find('input').trigger('focus')
      await nextTick()
      expect(direct.find('.custom-popover').exists()).toBe(true)
      expect(direct.find('.drp-calendar-month').exists()).toBe(true)

      // onClose closes it.
      await direct.find('.custom-popover').trigger('click')
      await nextTick()
      expect(direct.find('.custom-popover').exists()).toBe(false)
    })

    it('committing via the action bar closes the popover', async () => {
      const w = mountInput()
      await w.find('input').trigger('focus')
      await nextTick()

      // Select two days to enter 'selected' mode and surface the commit button
      const days = document.body.querySelectorAll<HTMLElement>(
        '.drp-day:not(.drp-day--outside):not(.drp-day--disabled)',
      )
      days[0].click()
      await nextTick()
      days[5].click()
      await nextTick()

      const commitBtn = document.body.querySelector<HTMLElement>('.drp-action-btn--primary')
      expect(commitBtn).not.toBeNull()
      commitBtn!.click()
      await nextTick()
      expect(document.body.querySelector('.drp-popover')).toBeNull()
    })
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
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeUndefined()

    // Click another day → back to selecting
    const days3 = getVisibleDayButtons(w)
    await days3[15].trigger('click')

    // Action bar still visible but commit disabled while selecting
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeDefined()
  })
})
