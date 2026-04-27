import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from './ActionBar.vue'

const messages = {
  commit: 'Valider',
  reset: 'Reset',
  viewSelection: 'Voir la sélection',
}

describe('ActionBar', () => {
  it('renders with disabled commit and reset in idle state', () => {
    const w = mount(ActionBar, {
      props: { state: 'idle', showViewSelection: false, messages },
    })
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    const primary = w.find('.drp-action-btn--primary')
    const secondary = w.find('.drp-action-btn--secondary')
    expect(primary.attributes('disabled')).toBeDefined()
    expect(secondary.attributes('disabled')).toBeDefined()
  })

  it('renders with disabled commit and reset in selecting state', () => {
    const w = mount(ActionBar, {
      props: { state: 'selecting', showViewSelection: false, messages },
    })
    expect(w.find('.drp-action-bar').exists()).toBe(true)
    const primary = w.find('.drp-action-btn--primary')
    const secondary = w.find('.drp-action-btn--secondary')
    expect(primary.attributes('disabled')).toBeDefined()
    expect(secondary.attributes('disabled')).toBeDefined()
  })

  it('enables commit and reset in selected state', () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false, messages },
    })
    expect(w.find('.drp-action-btn--primary').attributes('disabled')).toBeUndefined()
    expect(w.find('.drp-action-btn--secondary').attributes('disabled')).toBeUndefined()
  })

  it('shows commit and reset labels in selected state', () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false, messages },
    })
    const buttons = w.findAll('.drp-action-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Valider')
    expect(buttons[1].text()).toBe('Reset')
  })

  it('shows view-selection label when showViewSelection is true', () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: true, messages },
    })
    const buttons = w.findAll('.drp-action-btn')
    expect(buttons).toHaveLength(3)
    expect(buttons[2].text()).toBe('Voir la sélection')
  })

  it('renders custom messages', () => {
    const w = mount(ActionBar, {
      props: {
        state: 'selected',
        showViewSelection: true,
        messages: { commit: 'Apply', reset: 'Cancel', viewSelection: 'Show' },
      },
    })
    const buttons = w.findAll('.drp-action-btn')
    expect(buttons[0].text()).toBe('Apply')
    expect(buttons[1].text()).toBe('Cancel')
    expect(buttons[2].text()).toBe('Show')
  })

  it('emits commit when primary button is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false, messages },
    })
    await w.find('.drp-action-btn--primary').trigger('click')
    expect(w.emitted('commit')).toHaveLength(1)
  })

  it('emits reset when secondary button is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: false, messages },
    })
    await w.find('.drp-action-btn--secondary').trigger('click')
    expect(w.emitted('reset')).toHaveLength(1)
  })

  it('emits view-selection when tertiary button is clicked', async () => {
    const w = mount(ActionBar, {
      props: { state: 'selected', showViewSelection: true, messages },
    })
    await w.find('.drp-action-btn--tertiary').trigger('click')
    expect(w.emitted('view-selection')).toHaveLength(1)
  })
})
