<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { PopoverProps } from './types'

const props = withDefaults(defineProps<PopoverProps>(), { offset: 4 })

const emit = defineEmits<{ close: [] }>()

const popoverEl = ref<HTMLDivElement | null>(null)
const position = ref({ top: 0, left: 0 })

function updatePosition() {
  if (!props.anchor) return
  const rect = props.anchor.getBoundingClientRect()
  position.value = {
    top: rect.bottom + window.scrollY + props.offset,
    left: rect.left + window.scrollX,
  }
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
