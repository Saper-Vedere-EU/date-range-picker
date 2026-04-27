import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import Popover from './Popover.vue'

const mounted: VueWrapper[] = []

function makeHost(initialOpen = true) {
  const Host = defineComponent({
    setup() {
      const open = ref(initialOpen)
      const anchor = ref<HTMLElement | null>(null)
      const onClose = () => (open.value = false)
      return () =>
        h('div', [
          h('button', { ref: (el) => (anchor.value = el as HTMLElement) }, 'anchor'),
          h(
            Popover,
            { open: open.value, anchor: anchor.value, onClose },
            { default: () => h('div', { class: 'popover-content' }, 'content') },
          ),
        ])
    },
  })
  const w = mount(Host, { attachTo: document.body })
  mounted.push(w)
  return w
}

afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount()
})

function findPopoverContent() {
  return document.body.querySelector('.popover-content')
}

describe('Popover', () => {
  it('renders content via Teleport when open and anchor present', async () => {
    makeHost(true)
    await nextTick()
    expect(findPopoverContent()).not.toBeNull()
  })

  it('does not render when closed', async () => {
    makeHost(false)
    await nextTick()
    expect(findPopoverContent()).toBeNull()
  })

  it('emits close on outside mousedown', async () => {
    makeHost(true)
    await nextTick()
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    // The host toggles `open` to false, so the teleported content is unmounted
    expect(findPopoverContent()).toBeNull()
  })

  it('does NOT emit close when mousedown is inside the popover', async () => {
    makeHost(true)
    await nextTick()
    const content = findPopoverContent() as HTMLElement
    content.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(findPopoverContent()).not.toBeNull()
  })

  it('does NOT emit close when mousedown is on the anchor', async () => {
    const w = makeHost(true)
    await nextTick()
    const anchor = w.find('button').element as HTMLElement
    anchor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(findPopoverContent()).not.toBeNull()
  })

  it('emits close on Escape keydown', async () => {
    makeHost(true)
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(findPopoverContent()).toBeNull()
  })
})
