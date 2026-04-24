<script lang="ts" setup>
import { computed } from 'vue'
import { CalendarNavigation } from '@/components/molecules/CalendarNavigation'
import { ActionBar } from '@/components/molecules/ActionBar'
import { useDateRangePicker } from '@/composables/useDateRangePicker'
import type { PickerState } from '@/composables/useDateRangePicker/types'
import { defaultMessages, type DateRangePickerMessages } from '@/messages'

const start = defineModel<Date | undefined>('start')
const end = defineModel<Date | undefined>('end')

const props = withDefaults(
  defineProps<{
    locale?: string
    messages?: Partial<DateRangePickerMessages>
  }>(),
  { locale: 'fr-FR', messages: () => ({}) },
)

const mergedMessages = computed<DateRangePickerMessages>(() => ({
  ...defaultMessages,
  ...props.messages,
}))

defineSlots<{
  'nav-prev'(props: { onClick: () => void }): unknown
  'nav-next'(props: { onClick: () => void }): unknown
  'action-bar'(props: {
    state: PickerState
    showViewSelection: boolean
    onCommit: () => void
    onReset: () => void
    onViewSelection: () => void
  }): unknown
}>()

const {
  mode,
  leftMonth,
  rightMonth,
  leftGrid,
  rightGrid,
  showViewSelection,
  monthPickerSide,
  yearPickerSide,
  yearPickerBaseYear,
  selectDay,
  navigatePrev,
  navigateNext,
  commit,
  reset,
  viewSelection,
  openMonthPicker,
  selectMonth,
  openYearPicker,
  selectYear,
  dragSourceSide,
  startDragEndpoint,
  updateDragHover,
  commitDrag,
  cancelDrag,
  pageSourcePrev,
  pageSourceNext,
} = useDateRangePicker({
  committedStart: start,
  committedEnd: end,
})
</script>

<template>
  <div class="drp-date-range-picker">
    <CalendarNavigation
      :left-year="leftMonth.year"
      :left-month="leftMonth.month"
      :left-grid="leftGrid"
      :right-year="rightMonth.year"
      :right-month="rightMonth.month"
      :right-grid="rightGrid"
      :messages="mergedMessages"
      :locale="locale"
      :month-picker-side="monthPickerSide"
      :year-picker-side="yearPickerSide"
      :year-picker-base-year="yearPickerBaseYear"
      :drag-source-side="dragSourceSide"
      @prev="navigatePrev"
      @next="navigateNext"
      @select-day="selectDay"
      @click-month-header="openMonthPicker"
      @click-year-header="openYearPicker"
      @select-month="selectMonth"
      @select-year="selectYear"
      @drag-start-endpoint="startDragEndpoint"
      @drag-hover="updateDragHover"
      @drag-drop="commitDrag"
      @drag-end="cancelDrag"
      @auto-page-prev="pageSourcePrev"
      @auto-page-next="pageSourceNext"
    >
      <template v-if="$slots['nav-prev']" #nav-prev="slotProps">
        <slot name="nav-prev" v-bind="slotProps" />
      </template>
      <template v-if="$slots['nav-next']" #nav-next="slotProps">
        <slot name="nav-next" v-bind="slotProps" />
      </template>
    </CalendarNavigation>
    <slot
      name="action-bar"
      :state="mode"
      :show-view-selection="showViewSelection"
      :on-commit="commit"
      :on-reset="reset"
      :on-view-selection="viewSelection"
    >
      <ActionBar
        :state="mode"
        :show-view-selection="showViewSelection"
        :messages="mergedMessages"
        @commit="commit"
        @reset="reset"
        @view-selection="viewSelection"
      />
    </slot>
  </div>
</template>

<style scoped>
.drp-date-range-picker {
  display: inline-flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--drp-border, var(--border, #e5e4e7));
  border-radius: 12px;
  background: var(--drp-bg, var(--bg, #fff));
  font-family: var(--drp-font, var(--sans, system-ui, 'Segoe UI', Roboto, sans-serif));
}
</style>
