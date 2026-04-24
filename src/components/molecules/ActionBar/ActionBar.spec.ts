import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from './ActionBar.vue'

describe('ActionBar', () => {
  it('is hidden in idle state', () => {
    const w = mount(ActionBar, {
      props: { state: 'idle', showViewSelection: false },
    })
    expect(w.find('.drp-action-bar').exists()).toBe(false)
  })

  it('is hidden in selecting state', () => {
    const w = mount(ActionBar, {
      props: { state: 'selecting', showViewSelection: false },
    })
    expect(w.find('.drp-action-bar').exists()).toBe(false)
  })

  it('shows Valider and Reset in selected state', () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false },
    })
    const buttons = w.findAll('.drp-action-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Valider')
    expect(buttons[1].text()).toBe('Reset')
  })

  it('shows Voir la sélection when showViewSelection is true', () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: true },
    })
    const buttons = w.findAll('.drp-action-btn')
    expect(buttons).toHaveLength(3)
    expect(buttons[2].text()).toBe('Voir la sélection')
  })

  it('emits commit when Valider is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false },
    })
    await w.find('.drp-action-btn--primary').trigger('click')
    expect(w.emitted('commit')).toHaveLength(1)
  })

  it('emits reset when Reset is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false },
    })
    await w.find('.drp-action-btn--secondary').trigger('click')
    expect(w.emitted('reset')).toHaveLength(1)
  })

  it('emits view-selection when Voir la sélection is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: true },
    })
    await w.find('.drp-action-btn--tertiary').trigger('click')
    expect(w.emitted('view-selection')).toHaveLength(1)
  })
})
