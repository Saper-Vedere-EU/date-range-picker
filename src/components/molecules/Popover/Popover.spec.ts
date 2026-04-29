import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import Popover from './Popover.vue'

const mounted: VueWrapper[] = []

function makeRect(r: { top: number; bottom: number; left: number; right: number }): DOMRect {
  return {
    top: r.top,
    bottom: r.bottom,
    left: r.left,
    right: r.right,
    x: r.left,
    y: r.top,
    width: r.right - r.left,
    height: r.bottom - r.top,
    toJSON: () => ({}),
  }
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

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

  it('flips above the anchor when there is not enough room below', async () => {
    setViewport(1024, 600)
    const w = makeHost(true)
    await nextTick()
    const anchor = w.find('button').element as HTMLElement
    anchor.getBoundingClientRect = () =>
      makeRect({ top: 560, bottom: 590, left: 100, right: 250 })
    const pop = findPopoverContent()?.parentElement as HTMLElement
    pop.getBoundingClientRect = () => makeRect({ top: 0, bottom: 200, left: 0, right: 300 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    // anchor.top - popHeight - offset = 560 - 200 - 4 = 356
    expect(pop.style.top).toBe('356px')
  })

  it('shifts left when the anchor is near the right edge of the viewport', async () => {
    setViewport(800, 1000)
    const w = makeHost(true)
    await nextTick()
    const anchor = w.find('button').element as HTMLElement
    anchor.getBoundingClientRect = () =>
      makeRect({ top: 100, bottom: 130, left: 700, right: 780 })
    const pop = findPopoverContent()?.parentElement as HTMLElement
    pop.getBoundingClientRect = () => makeRect({ top: 0, bottom: 250, left: 0, right: 400 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    // viewport - popWidth - margin = 800 - 400 - 8 = 392
    expect(pop.style.left).toBe('392px')
  })
})
