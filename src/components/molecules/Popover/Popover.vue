<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { PopoverProps } from './types'

const props = withDefaults(defineProps<PopoverProps>(), { offset: 4 })

const emit = defineEmits<{ close: [] }>()

const VIEWPORT_MARGIN = 8

const popoverEl = ref<HTMLDivElement | null>(null)
const position = ref({ top: 0, left: 0 })

function updatePosition() {
  if (!props.anchor) return
  const anchor = props.anchor.getBoundingClientRect()
  const pop = popoverEl.value?.getBoundingClientRect()
  const popWidth = pop?.width ?? 0
  const popHeight = pop?.height ?? 0
  const offset = props.offset
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Flip above the anchor when there is not enough room below and more above.
  const spaceBelow = vh - anchor.bottom
  const spaceAbove = anchor.top
  const flipUp =
    popHeight > 0 &&
    spaceBelow < popHeight + offset + VIEWPORT_MARGIN &&
    spaceAbove > spaceBelow

  const top = flipUp
    ? anchor.top + window.scrollY - popHeight - offset
    : anchor.bottom + window.scrollY + offset

  // Default: align the popover's left edge with the anchor's left edge.
  // If that overflows the viewport on the right, align the popover's right
  // edge with the anchor's right edge instead. Finally, clamp to the left
  // viewport edge.
  let left = anchor.left + window.scrollX
  if (popWidth > 0) {
    const rightLimit = window.scrollX + vw - VIEWPORT_MARGIN
    if (left + popWidth > rightLimit) {
      left = anchor.right + window.scrollX - popWidth
    }
    const minLeft = window.scrollX + VIEWPORT_MARGIN
    left = Math.max(left, minLeft)
  }

  position.value = { top, left }
}

function onMouseDown(e: MouseEvent) {
  const target = e.target as Node | null
  if (!target) return
  if (popoverEl.value?.contains(target)) return
  if (props.anchor?.contains(target)) return
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function attachListeners() {
  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
}

function detachListeners() {
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      // Wait for the teleported node to mount before measuring.
      await nextTick()
      updatePosition()
      attachListeners()
    } else {
      detachListeners()
    }
  },
  { immediate: true },
)

watch(
  () => props.anchor,
  () => {
    if (props.open) updatePosition()
  },
)

onBeforeUnmount(detachListeners)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && anchor"
      ref="popoverEl"
      class="drp-popover"
      role="dialog"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
    >
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.drp-popover {
  position: absolute;
  z-index: 1000;
}
</style>
