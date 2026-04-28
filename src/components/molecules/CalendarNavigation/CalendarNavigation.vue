<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { CalendarNavigationProps } from './types'
import { NavArrow } from '@/components/atoms/NavArrow'
import { CalendarMonth } from '@/components/molecules/CalendarMonth'
import { nextMonth } from '@/composables/useDateRangePicker/calendar-utils'

const props = withDefaults(defineProps<CalendarNavigationProps>(), {
  locale: 'fr-FR',
  monthPickerSide: null,
  yearPickerSide: null,
  dragSourceSide: null,
})

const emit = defineEmits<{
  prev: []
  next: []
  'select-day': [date: Date]
  'click-month-header': [side: 'left' | 'right']
  'click-year-header': [side: 'left' | 'right']
  'select-month': [side: 'left' | 'right', month: number]
  'select-year': [side: 'left' | 'right', year: number]
  'drag-start-endpoint': [endpoint: 'start' | 'end']
  'drag-hover': [date: Date]
  'drag-drop': []
  'drag-end': []
  'auto-page-prev': []
  'auto-page-next': []
}>()

defineSlots<{
  'nav-prev'(props: { onClick: () => void }): unknown
  'nav-next'(props: { onClick: () => void }): unknown
}>()

function onPrevClick() {
  emit('prev')
}
function onNextClick() {
  emit('next')
}

const leftWrap = ref<HTMLDivElement | null>(null)
const rightWrap = ref<HTMLDivElement | null>(null)

const isConsecutive = computed(() => {
  const next = nextMonth({ year: props.leftYear, month: props.leftMonth })
  return next.year === props.rightYear && next.month === props.rightMonth
})

const leftAcceptsDrop = computed(() => {
  if (!props.dragSourceSide) return true
  if (isConsecutive.value) return true
  return props.dragSourceSide === 'left'
})

const rightAcceptsDrop = computed(() => {
  if (!props.dragSourceSide) return true
  if (isConsecutive.value) return true
  return props.dragSourceSide === 'right'
})

const AUTO_PAGE_INITIAL_DELAY_MS = 500
const AUTO_PAGE_REPEAT_DELAY_MS = 900

const activeZone = ref<'prev' | 'next' | null>(null)
let pageTimerId: ReturnType<typeof setTimeout> | null = null

function canPage(zone: 'prev' | 'next'): boolean {
  if (!props.dragSourceSide) return false
  if (props.dragSourceSide === 'left') {
    return zone === 'prev' || !isConsecutive.value
  }
  return zone === 'next' || !isConsecutive.value
}

function clearPageTimer() {
  if (pageTimerId !== null) {
    clearTimeout(pageTimerId)
    pageTimerId = null
  }
  activeZone.value = null
}

function schedulePaging(zone: 'prev' | 'next') {
  if (!canPage(zone)) {
    clearPageTimer()
    return
  }
  if (activeZone.value === zone && pageTimerId !== null) return
  clearPageTimer()
  activeZone.value = zone
  const fire = () => {
    if (!canPage(zone)) {
      clearPageTimer()
      return
    }
    if (zone === 'prev') {
      emit('auto-page-prev')
    } else {
      emit('auto-page-next')
    }

    pageTimerId = setTimeout(fire, AUTO_PAGE_REPEAT_DELAY_MS)
  }
  pageTimerId = setTimeout(fire, AUTO_PAGE_INITIAL_DELAY_MS)
}

function handleDragOver(e: DragEvent) {
  if (!props.dragSourceSide) {
    clearPageTimer()
    return
  }
  const wrap = props.dragSourceSide === 'left' ? leftWrap.value : rightWrap.value
  if (!wrap) {
    clearPageTimer()
    return
  }
  const rect = wrap.getBoundingClientRect()
  if (e.clientX < rect.left) {
    schedulePaging('prev')
  } else if (e.clientX > rect.right) {
    schedulePaging('next')
  } else {
    clearPageTimer()
  }
}

function handleDragLeave(e: DragEvent) {
  const nav = e.currentTarget as HTMLElement
  const related = e.relatedTarget as Node | null
  if (!related || !nav.contains(related)) {
    clearPageTimer()
  }
}

watch(
  () => props.dragSourceSide,
  (v: 'left' | 'right' | null | undefined) => {
    if (!v) clearPageTimer()
  },
)

onBeforeUnmount(clearPageTimer)
</script>

<template>
  <div
    class="drp-calendar-navigation"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <div
      class="drp-drop-indicator drp-drop-indicator--prev"
      :class="{ 'drp-drop-indicator--active': activeZone === 'prev' }"
      aria-hidden="true"
    />
    <div ref="leftWrap" class="drp-calendar-slot drp-calendar-slot--left">
      <div class="drp-nav-arrow-slot drp-nav-arrow-slot--prev">
        <slot name="nav-prev" :on-click="onPrevClick">
          <NavArrow direction="left" :label="messages.prevMonth" @click="onPrevClick" />
        </slot>
      </div>
      <CalendarMonth
        :year="leftYear"
        :month="leftMonth"
        :grid="leftGrid"
        :locale="locale"
        :month-picker-open="monthPickerSide === 'left'"
        :year-picker-open="yearPickerSide === 'left'"
        :year-picker-base-year="yearPickerBaseYear"
        :accepts-drop="leftAcceptsDrop"
        @select-day="(date: Date) => emit('select-day', date)"
        @click-month-header="emit('click-month-header', 'left')"
        @click-year-header="emit('click-year-header', 'left')"
        @select-month="(m: number) => emit('select-month', 'left', m)"
        @select-year="(y: number) => emit('select-year', 'left', y)"
        @drag-start-endpoint="(endpoint: 'start' | 'end') => emit('drag-start-endpoint', endpoint)"
        @drag-hover="(d: Date) => emit('drag-hover', d)"
        @drop="emit('drag-drop')"
        @drag-end="emit('drag-end')"
      />
    </div>
    <div ref="rightWrap" class="drp-calendar-slot drp-calendar-slot--right">
      <CalendarMonth
        :year="rightYear"
        :month="rightMonth"
        :grid="rightGrid"
        :locale="locale"
        :month-picker-open="monthPickerSide === 'right'"
        :year-picker-open="yearPickerSide === 'right'"
        :year-picker-base-year="yearPickerBaseYear"
        :accepts-drop="rightAcceptsDrop"
        @select-day="(date: Date) => emit('select-day', date)"
        @click-month-header="emit('click-month-header', 'right')"
        @click-year-header="emit('click-year-header', 'right')"
        @select-month="(m: number) => emit('select-month', 'right', m)"
        @select-year="(y: number) => emit('select-year', 'right', y)"
        @drag-start-endpoint="(endpoint: 'start' | 'end') => emit('drag-start-endpoint', endpoint)"
        @drag-hover="(d: Date) => emit('drag-hover', d)"
        @drop="emit('drag-drop')"
        @drag-end="emit('drag-end')"
      />
      <div class="drp-nav-arrow-slot drp-nav-arrow-slot--next">
        <slot name="nav-next" :on-click="onNextClick">
          <NavArrow direction="right" :label="messages.nextMonth" @click="onNextClick" />
        </slot>
      </div>
    </div>
    <div
      class="drp-drop-indicator drp-drop-indicator--next"
      :class="{ 'drp-drop-indicator--active': activeZone === 'next' }"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.drp-calendar-navigation {
  display: flex;
  align-items: flex-start;
}

.drp-calendar-slot {
  position: relative;
  display: flex;
}

.drp-calendar-slot--left {
  margin-right: 16px;
}

/*
 * Arrows sit at the same Y as the month/year header and at the same X as the
 * first/last column of the day grid. The 2px offset = (cell_width - arrow_width) / 2
 * with cell_width=36 (CalendarMonth) and arrow_width=32 (NavArrow) — centers the
 * arrow over the leftmost / rightmost day cell.
 */
.drp-nav-arrow-slot {
  position: absolute;
  top: 3px; /* vertically centers a 32px arrow on the ~38px-tall month header */
  display: flex;
  align-items: center;
  z-index: 1;
}

.drp-nav-arrow-slot--prev {
  left: 2px;
}

.drp-nav-arrow-slot--next {
  right: 2px;
}

.drp-drop-indicator {
  width: 2px;
  height: 226px;
  align-self: flex-end;
  border-radius: 2px;
  background: transparent;
  transition: background-color 0.15s;
  flex-shrink: 0;
}

.drp-drop-indicator--prev {
  margin-right: 8px;
}

.drp-drop-indicator--next {
  margin-left: 8px;
}

.drp-drop-indicator--active {
  background: var(--drp-accent);
}
</style>
