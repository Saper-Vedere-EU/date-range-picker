<script lang="ts" setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import type { CalendarDayProps } from './types'

const props = withDefaults(defineProps<CalendarDayProps>(), {
  acceptsDrop: true,
})
const emit = defineEmits<{
  click: []
  'drag-start-endpoint': [endpoint: 'start' | 'end']
  'drag-enter': []
  drop: []
  'drag-end': []
}>()

const canDrag = computed(() => !props.isDisabled && (props.isRangeStart || props.isRangeEnd))

const isPressed = ref(false)

function releasePressed() {
  isPressed.value = false
  document.removeEventListener('mouseup', releasePressed)
}

function handleMouseDown() {
  if (props.isDisabled) return
  isPressed.value = true
  // Catch mouseup outside the button (mouseup doesn't bubble once a drag starts,
  // but this covers simple clicks and drag cancels that land elsewhere).
  document.addEventListener('mouseup', releasePressed)
}

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', releasePressed)
})

function handleClick() {
  if (!props.isDisabled) {
    emit('click')
  }
}

function setInvisibleDragImage(e: DragEvent) {
  if (!e.dataTransfer) return
  const ghost = document.createElement('div')
  ghost.style.position = 'fixed'
  ghost.style.top = '-1000px'
  ghost.style.left = '-1000px'
  ghost.style.width = '1px'
  ghost.style.height = '1px'
  ghost.style.opacity = '0'
  ghost.style.pointerEvents = 'none'
  document.body.appendChild(ghost)
  e.dataTransfer.setDragImage(ghost, 0, 0)
  // Remove the node after the browser has snapshotted it
  requestAnimationFrame(() => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost)
  })
}

function handleDragStart(e: DragEvent) {
  if (!canDrag.value) {
    e.preventDefault()
    return
  }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    // Firefox requires some data to be set
    e.dataTransfer.setData('text/plain', '')
  }
  setInvisibleDragImage(e)
  // Single-day range: both flags are true → treat as "start"
  const endpoint = props.isRangeStart ? 'start' : 'end'
  emit('drag-start-endpoint', endpoint)
}

function handleDragEnter(e: DragEvent) {
  if (!props.acceptsDrop) {
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'
    return
  }
  e.preventDefault()
  emit('drag-enter')
}

function handleDragOver(e: DragEvent) {
  if (!props.acceptsDrop) {
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'
    return
  }
  // Required to allow a drop
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
  if (!props.acceptsDrop) return
  e.preventDefault()
  emit('drop')
}

function handleDragEnd() {
  isPressed.value = false
  document.removeEventListener('mouseup', releasePressed)
  emit('drag-end')
}
</script>

<template>
  <button
    type="button"
    class="drp-day"
    :class="{
      'drp-day--today': isToday,
      'drp-day--outside': isOutsideMonth,
      'drp-day--selected': isSelected,
      'drp-day--range-start': isRangeStart,
      'drp-day--range-end': isRangeEnd,
      'drp-day--in-range': isInRange,
      'drp-day--disabled': isDisabled,
      'drp-day--draggable': canDrag,
      'drp-day--pressed': isPressed,
    }"
    :disabled="isDisabled"
    :draggable="canDrag"
    @mousedown="handleMouseDown"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
  >
    {{ day }}
  </button>
</template>

<style scoped>
.drp-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--drp-day-color, var(--text-h, #08060d));
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.drp-day--draggable {
  cursor: grab;
}

.drp-day--draggable:active,
.drp-day--draggable.drp-day--pressed {
  cursor: grabbing;
}

.drp-day:hover:not(.drp-day--disabled):not(.drp-day--selected):not(.drp-day--range-start):not(
    .drp-day--range-end
  ) {
  background: var(--drp-day-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
}

.drp-day--today {
  border: 1px solid var(--drp-today-border, var(--accent-border, rgba(170, 59, 255, 0.5)));
}

.drp-day--outside {
  opacity: 0.3;
}

.drp-day--selected,
.drp-day--range-start,
.drp-day--range-end {
  background: var(--drp-accent, var(--accent, #aa3bff));
  color: #fff;
}

.drp-day--range-start {
  border-radius: 50% 0 0 50%;
}

.drp-day--range-end {
  border-radius: 0 50% 50% 0;
}

.drp-day--range-start.drp-day--range-end {
  border-radius: 50%;
}

.drp-day--in-range {
  background: var(--drp-range-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
  border-radius: 0;
}

.drp-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.drp-day--pressed:not(.drp-day--disabled) {
  background: var(--drp-day-press-bg, rgba(170, 59, 255, 0.25));
}

.drp-day--pressed.drp-day--in-range {
  background: var(--drp-range-press-bg, rgba(170, 59, 255, 0.3));
}

.drp-day--pressed.drp-day--selected,
.drp-day--pressed.drp-day--range-start,
.drp-day--pressed.drp-day--range-end {
  background: var(--drp-accent-pressed, #8528c7);
}
</style>
