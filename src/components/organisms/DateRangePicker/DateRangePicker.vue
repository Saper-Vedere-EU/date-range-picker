<script lang="ts" setup>
import { computed, ref } from 'vue'
import { CalendarNavigation } from '@/components/molecules/CalendarNavigation'
import { ActionBar } from '@/components/molecules/ActionBar'
import { DateRangeInput } from '@/components/molecules/DateRangeInput'
import { Popover } from '@/components/molecules/Popover'
import { useDateRangePicker } from '@/composables/useDateRangePicker'
import type { PickerState } from '@/composables/useDateRangePicker/types'
import { defaultMessages, type DateRangePickerMessages } from '@/messages'
import { themeToCssVars, type DateRangePickerTheme } from '@/theme'
import type { DateRangeInputSlotBindings } from '@/components/molecules/DateRangeInput'
import type { DateRangePickerMode } from './types'

const start = defineModel<Date | undefined>('start')
const end = defineModel<Date | undefined>('end')

const props = withDefaults(
  defineProps<{
    locale?: string
    messages?: Partial<DateRangePickerMessages>
    theme?: Partial<DateRangePickerTheme>
    mode?: DateRangePickerMode
    inputFormat?: string
    inputSeparator?: string
    inputPlaceholder?: string
  }>(),
  {
    locale: 'fr-FR',
    messages: () => ({}),
    theme: () => ({}),
    mode: 'inline',
    inputFormat: 'dd/MM/yyyy',
    inputSeparator: ' - ',
    inputPlaceholder: undefined,
  },
)

const mergedMessages = computed<DateRangePickerMessages>(() => ({
  ...defaultMessages,
  ...props.messages,
}))

const themeStyle = computed(() => themeToCssVars(props.theme))

// Input-mode state
const popoverOpen = ref(false)
const inputWrapperEl = ref<HTMLDivElement | null>(null)

function openPopover() {
  focusCommittedRange()
  popoverOpen.value = true
}

function closePopover() {
  popoverOpen.value = false
}

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
  /**
   * Replace the default text input in `mode="input"`. Receives bindings
   * (value, onValueChange, onFocus, onBlur, onKeydown, attrs) — see
   * {@link DateRangeInputSlotBindings}.
   */
  input(bindings: DateRangeInputSlotBindings): unknown
}>()

const {
  mode: pickerMode,
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
  focusCommittedRange,
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

// In input mode, committing also dismisses the popover.
function onCommit() {
  commit()
  if (props.mode === 'input') closePopover()
}
</script>

<template>
  <!-- Inline mode: render calendar directly -->
  <div v-if="mode === 'inline'" class="drp-date-range-picker" :style="themeStyle">
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
      :state="pickerMode"
      :show-view-selection="showViewSelection"
      :on-commit="onCommit"
      :on-reset="reset"
      :on-view-selection="viewSelection"
    >
      <ActionBar
        :state="pickerMode"
        :show-view-selection="showViewSelection"
        :messages="mergedMessages"
        @commit="onCommit"
        @reset="reset"
        @view-selection="viewSelection"
      />
    </slot>
  </div>

  <!-- Input mode: text input + popover -->
  <div v-else ref="inputWrapperEl" class="drp-date-range-input-wrapper">
    <DateRangeInput
      :start="start"
      :end="end"
      :format="inputFormat"
      :separator="inputSeparator"
      :placeholder="inputPlaceholder"
      @update:start="start = $event"
      @update:end="end = $event"
      @focus="openPopover"
      @submit="closePopover"
    >
      <template v-if="$slots.input" #default="bindings">
        <slot name="input" v-bind="bindings" />
      </template>
    </DateRangeInput>
    <Popover :open="popoverOpen" :anchor="inputWrapperEl" @close="closePopover">
      <div class="drp-date-range-picker" :style="themeStyle">
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
          :state="pickerMode"
          :show-view-selection="showViewSelection"
          :on-commit="onCommit"
          :on-reset="reset"
          :on-view-selection="viewSelection"
        >
          <ActionBar
            :state="pickerMode"
            :show-view-selection="showViewSelection"
            :messages="mergedMessages"
            @commit="onCommit"
            @reset="reset"
            @view-selection="viewSelection"
          />
        </slot>
      </div>
    </Popover>
  </div>
</template>

<style>
/*
 * Unscoped theme token declarations. Using `:where()` keeps specificity at
 * (0,0,0) so consumers can override any token with a plain
 * `.drp-date-range-picker { --drp-accent: ... }` rule loaded after the
 * library stylesheet — no `!important` or attribute-selector trickery needed.
 */
:where(.drp-date-range-picker) {
  --drp-accent: #aa3bff;
  --drp-accent-pressed: color-mix(in srgb, var(--drp-accent) 75%, #000);
  --drp-accent-subtle: color-mix(in srgb, var(--drp-accent) 10%, transparent);
  --drp-accent-muted: color-mix(in srgb, var(--drp-accent) 25%, transparent);
  --drp-accent-emphasis: color-mix(in srgb, var(--drp-accent) 30%, transparent);
  --drp-accent-border: color-mix(in srgb, var(--drp-accent) 50%, transparent);
  --drp-on-accent: #fff;
  --drp-bg: #fff;
  --drp-text: #08060d;
  --drp-muted-text: #6b6375;
  --drp-border: #e5e4e7;
  --drp-font: system-ui, 'Segoe UI', Roboto, sans-serif;
}
</style>

<style scoped>
.drp-date-range-picker {
  display: inline-flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--drp-border);
  border-radius: 12px;
  background: var(--drp-bg);
  font-family: var(--drp-font);
  color: var(--drp-text);
}

.drp-date-range-input-wrapper {
  display: inline-block;
}
</style>
