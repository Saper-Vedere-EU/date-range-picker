import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavArrow from './NavArrow.vue'

describe('NavArrow', () => {
  it('renders left arrow', () => {
    const w = mount(NavArrow, { props: { direction: 'left', label: 'Previous' } })
    expect(w.text()).toBe('‹')
    expect(w.find('button').classes()).toContain('drp-nav-arrow--left')
  })

  it('renders right arrow', () => {
    const w = mount(NavArrow, { props: { direction: 'right', label: 'Next' } })
    expect(w.text()).toBe('›')
    expect(w.find('button').classes()).toContain('drp-nav-arrow--right')
  })

  it('emits click when clicked', async () => {
    const w = mount(NavArrow, { props: { direction: 'left', label: 'Previous' } })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('is disabled when disabled prop is true', () => {
    const w = mount(NavArrow, {
      props: { direction: 'left', label: 'Previous', disabled: true },
    })
    expect(w.find('button').attributes('disabled')).toBeDefined()
  })

  it('uses the given label as aria-label', () => {
    const w = mount(NavArrow, { props: { direction: 'left', label: 'Vorheriger Monat' } })
    expect(w.find('button').attributes('aria-label')).toBe('Vorheriger Monat')
  })
})
