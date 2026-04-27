import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { PresetList } from './index'
import type { DateRangePickerPreset } from './types'

const today: DateRangePickerPreset = {
  title: 'Today',
  getRange: () => ({ start: new Date(2026, 3, 27), end: new Date(2026, 3, 27) }),
}
const last7: DateRangePickerPreset = {
  title: 'Last 7 days',
  getRange: () => ({ start: new Date(2026, 3, 21), end: new Date(2026, 3, 27) }),
}
const thisMonth: DateRangePickerPreset = {
  title: 'This month',
  getRange: () => ({ start: new Date(2026, 3, 1), end: new Date(2026, 3, 30) }),
}

describe('PresetList', () => {
  it('renders one button per preset across all groups', () => {
    const w = mount(PresetList, { props: { groups: [[today, last7], [thisMonth]] } })
    const buttons = w.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((b) => b.text())).toEqual(['Today', 'Last 7 days', 'This month'])
  })

  it('renders a separator between groups but not before the first', () => {
    const w = mount(PresetList, { props: { groups: [[today, last7], [thisMonth]] } })
    expect(w.findAll('hr')).toHaveLength(1)
  })

  it('renders no separator with a single group', () => {
    const w = mount(PresetList, { props: { groups: [[today, last7]] } })
    expect(w.findAll('hr')).toHaveLength(0)
  })

  it('skips empty groups (no separator, no buttons)', () => {
    const w = mount(PresetList, { props: { groups: [[today], [], [thisMonth]] } })
    expect(w.findAll('button')).toHaveLength(2)
    expect(w.findAll('hr')).toHaveLength(1)
  })

  it('emits select with the clicked preset', async () => {
    const w = mount(PresetList, { props: { groups: [[today, last7]] } })
    await w.findAll('button')[1].trigger('click')
    const events = w.emitted('select')
    expect(events).toHaveLength(1)
    const emitted = events![0][0] as DateRangePickerPreset
    expect(emitted.title).toBe('Last 7 days')
    const range = emitted.getRange()
    expect(range.start).toEqual(new Date(2026, 3, 21))
    expect(range.end).toEqual(new Date(2026, 3, 27))
  })

  it('renders nothing when groups are empty', () => {
    const w = mount(PresetList, { props: { groups: [] } })
    expect(w.findAll('button')).toHaveLength(0)
    expect(w.findAll('hr')).toHaveLength(0)
  })
})
