import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangeInput from './DateRangeInput.vue'
import type { DateRangeInputSlotBindings } from './types'

describe('DateRangeInput', () => {
  it('renders the template as placeholder by default', () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    expect(w.find('input').attributes('placeholder')).toBe('dd/MM/yyyy - dd/MM/yyyy')
  })

  it('reflects the committed range as formatted text', () => {
    const w = mount(DateRangeInput, {
      props: { start: new Date(2026, 3, 5), end: new Date(2026, 3, 15) },
    })
    expect((w.find('input').element as HTMLInputElement).value).toBe('05/04/2026 - 15/04/2026')
  })

  it('auto-inserts separators as digits are typed', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    const input = w.find('input')

    await input.setValue('15')
    expect((input.element as HTMLInputElement).value).toBe('15/')

    await input.setValue('15/04')
    expect((input.element as HTMLInputElement).value).toBe('15/04/')

    await input.setValue('15/04/2026')
    expect((input.element as HTMLInputElement).value).toBe('15/04/2026 - ')
  })

  it('emits update:start and update:end once the range is complete and valid', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    const input = w.find('input')
    await input.setValue('15/04/2026 - 20/04/2026')

    const startEvents = w.emitted('update:start')
    const endEvents = w.emitted('update:end')
    expect(startEvents).toBeTruthy()
    expect(endEvents).toBeTruthy()
    expect((startEvents![0][0] as Date).getTime()).toBe(new Date(2026, 3, 15).getTime())
    expect((endEvents![0][0] as Date).getTime()).toBe(new Date(2026, 3, 20).getTime())
  })

  it('does not emit for incomplete input', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    await w.find('input').setValue('15/04/2026')
    expect(w.emitted('update:start')).toBeFalsy()
  })

  it('reverts on blur when input is invalid', async () => {
    const start = new Date(2026, 3, 5)
    const end = new Date(2026, 3, 15)
    const w = mount(DateRangeInput, { props: { start, end } })
    const input = w.find('input')

    await input.setValue('99')
    expect((input.element as HTMLInputElement).value).toBe('99/')

    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('05/04/2026 - 15/04/2026')
  })

  it('clears both v-models when the input is emptied and blurred', async () => {
    const w = mount(DateRangeInput, {
      props: { start: new Date(2026, 3, 5), end: new Date(2026, 3, 15) },
    })
    const input = w.find('input')
    await input.setValue('')
    await input.trigger('blur')
    expect((w.emitted('update:start')?.at(-1) ?? [])[0]).toBeUndefined()
    expect((w.emitted('update:end')?.at(-1) ?? [])[0]).toBeUndefined()
  })

  it('emits submit when Enter is pressed with a valid complete range', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    const input = w.find('input')
    await input.setValue('15/04/2026 - 20/04/2026')
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('submit')).toBeTruthy()
  })

  it('does not emit submit when Enter is pressed with an incomplete range', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    const input = w.find('input')
    await input.setValue('15/04/2026')
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('submit')).toBeFalsy()
  })

  it('emits focus on input focus', async () => {
    const w = mount(DateRangeInput, { props: { start: undefined, end: undefined } })
    await w.find('input').trigger('focus')
    expect(w.emitted('focus')).toBeTruthy()
  })

  it('respects a custom format', async () => {
    const w = mount(DateRangeInput, {
      props: {
        start: new Date(2026, 3, 5),
        end: new Date(2026, 3, 15),
        format: 'yyyy-MM-dd',
        separator: ' → ',
      },
    })
    expect((w.find('input').element as HTMLInputElement).value).toBe('2026-04-05 → 2026-04-15')
  })

  describe('default slot', () => {
    it('exposes value, handlers and attrs to the slot', () => {
      let received: DateRangeInputSlotBindings | null = null
      mount(DateRangeInput, {
        props: { start: new Date(2026, 3, 5), end: new Date(2026, 3, 15), ariaLabel: 'Range' },
        slots: {
          default: (bindings: DateRangeInputSlotBindings) => {
            received = bindings
            return null
          },
        },
      })
      expect(received).not.toBeNull()
      expect(received!.value).toBe('05/04/2026 - 15/04/2026')
      expect(typeof received!.onValueChange).toBe('function')
      expect(typeof received!.onFocus).toBe('function')
      expect(typeof received!.onBlur).toBe('function')
      expect(typeof received!.onKeydown).toBe('function')
      expect(received!.attrs).toMatchObject({
        placeholder: 'dd/MM/yyyy - dd/MM/yyyy',
        maxlength: 23,
        'aria-label': 'Range',
      })
    })

    it('replaces the native input when a slot is provided', () => {
      const w = mount(DateRangeInput, {
        props: { start: undefined, end: undefined },
        slots: {
          default: `<template #default="{ value, attrs }">
            <div class="custom-wrapper">
              <span data-testid="value">{{ value }}</span>
              <span data-testid="placeholder">{{ attrs.placeholder }}</span>
            </div>
          </template>`,
        },
      })
      expect(w.find('input').exists()).toBe(false)
      expect(w.find('.custom-wrapper').exists()).toBe(true)
    })

    it('drives parsing through the slot bindings', async () => {
      const w = mount(DateRangeInput, {
        props: { start: undefined, end: undefined },
        slots: {
          default: `<template #default="b">
            <input class="custom-input" :value="b.value" @input="b.onValueChange($event.target.value)" />
          </template>`,
        },
      })
      const input = w.find('input.custom-input')
      await input.setValue('15/04/2026 - 20/04/2026')
      expect(w.emitted('update:start')).toBeTruthy()
      expect((w.emitted('update:start')![0][0] as Date).getTime()).toBe(
        new Date(2026, 3, 15).getTime(),
      )
    })
  })
})
