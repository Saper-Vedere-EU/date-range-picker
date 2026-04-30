<script lang="ts" setup>
import { computed, provide, ref } from 'vue'
import { DateRangeInput } from '@/components/molecules/DateRangeInput'
import { Popover } from '@/components/molecules/Popover'
import {
  type DateRangePickerPreset,
  type DateRangePickerPresets,
} from '@/components/molecules/PresetList'
import { DateRangePickerPanel } from '@/components/organisms/DateRangePickerPanel'
import { useDateRangePicker } from '@/composables/useDateRangePicker'
import { defaultMessages, type DateRangePickerMessages } from '@/messages'
import { themeToCssVars, type DateRangePickerTheme } from '@/theme'
import type { DateRangeInputSlotBindings } from '@/components/molecules/DateRangeInput'
import type { DateRangePickerMode } from './types'
import { dateRangePickerContextKey, type DateRangePickerContext } from './context'
import type {
  DateRangePickerPanelNavSlotProps,
  DateRangePickerPanelActionBarSlotProps,
  DateRangePickerPanelPresetsSlotProps,
} from '@/components/organisms/DateRangePickerPanel'

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
    presets?: DateRangePickerPresets
  }>(),
  {
    locale: 'fr-FR',
    messages: () => ({}),
    theme: () => ({}),
    mode: 'inline',
    inputFormat: 'dd/MM/yyyy',
    inputSeparator: ' - ',
    inputPlaceholder: undefined,
    presets: () => [],
  },
)

const localeRef = computed(() => props.locale)
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
  'nav-prev'(props: DateRangePickerPanelNavSlotProps): unknown
  'nav-next'(props: DateRangePickerPanelNavSlotProps): unknown
  'action-bar'(props: DateRangePickerPanelActionBarSlotProps): unknown
  /**
   * Replace the default text input in `mode="input"`. Receives bindings
   * (value, onValueChange, onFocus, onBlur, onKeydown, attrs) — see
   * {@link DateRangeInputSlotBindings}.
   */
  input(bindings: DateRangeInputSlotBindings): unknown
  /**
   * Replace the default preset list. Receives the presets normalised as
   * groups (each inner array is rendered as one section, separated visually
   * from the next) and an `onSelect` handler — call it with a preset to
   * apply the corresponding range and switch the picker to `selected` mode.
   */
  presets(props: DateRangePickerPanelPresetsSlotProps): unknown
  /**
   * Replace the built-in popover used in `mode="input"`. Receives `open`,
   * `anchor` (the input wrapper), and `onClose`. Drop a
   * `<DateRangePickerPanel />` inside your custom popover so the calendar
   * still mounts. Only used when `mode="input"`.
   */
  popover(props: { open: boolean; anchor: HTMLElement | null; onClose: () => void }): unknown
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
  applyRange,
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

function onSelectPreset(preset: DateRangePickerPreset) {
  const { start: s, end: e } = preset.getRange()
  applyRange(s, e)
}

const presetGroups = computed<DateRangePickerPreset[][]>(() => {
  const p = props.presets
  if (!p || p.length === 0) return []
  // 2D shape: first item is itself an array
  if (Array.isArray(p[0])) return (p as DateRangePickerPreset[][]).filter((g) => g.length > 0)
  return [p as DateRangePickerPreset[]]
})

const hasPresets = computed(() => presetGroups.value.some((g) => g.length > 0))

const context: DateRangePickerContext = {
  locale: localeRef,
  messages: mergedMessages,
  themeStyle,
  mode: pickerMode,
  leftMonth,
  rightMonth,
  leftGrid,
  rightGrid,
  showViewSelection,
  monthPickerSide,
  yearPickerSide,
  yearPickerBaseYear,
  dragSourceSide,
  presetGroups,
  hasPresets,
  onSelectPreset,
  selectDay,
  navigatePrev,
  navigateNext,
  onCommit,
  reset,
  viewSelection,
  openMonthPicker,
  selectMonth,
  openYearPicker,
  selectYear,
  startDragEndpoint,
  updateDragHover,
  commitDrag,
  cancelDrag,
  pageSourcePrev,
  pageSourceNext,
}

provide(dateRangePickerContextKey, context)
</script>

<template>
  <!-- Inline mode: render the panel directly -->
  <DateRangePickerPanel v-if="mode === 'inline'">
    <template v-if="$slots['nav-prev']" #nav-prev="slotProps">
      <slot name="nav-prev" v-bind="slotProps" />
    </template>
    <template v-if="$slots['nav-next']" #nav-next="slotProps">
      <slot name="nav-next" v-bind="slotProps" />
    </template>
    <template v-if="$slots['action-bar']" #action-bar="slotProps">
      <slot name="action-bar" v-bind="slotProps" />
    </template>
    <template v-if="$slots['presets']" #presets="slotProps">
      <slot name="presets" v-bind="slotProps" />
    </template>
  </DateRangePickerPanel>

  <!-- Input mode: text input + popover wrapping the panel -->
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
      <template v-if="!!$slots.input" #default="bindings">
        <slot name="input" v-bind="bindings" />
      </template>
    </DateRangeInput>
    <slot name="popover" :open="popoverOpen" :anchor="inputWrapperEl" :on-close="closePopover">
      <Popover :open="popoverOpen" :anchor="inputWrapperEl" @close="closePopover">
        <DateRangePickerPanel>
          <template v-if="$slots['nav-prev']" #nav-prev="slotProps">
            <slot name="nav-prev" v-bind="slotProps" />
          </template>
          <template v-if="$slots['nav-next']" #nav-next="slotProps">
            <slot name="nav-next" v-bind="slotProps" />
          </template>
          <template v-if="$slots['action-bar']" #action-bar="slotProps">
            <slot name="action-bar" v-bind="slotProps" />
          </template>
          <template v-if="$slots['presets']" #presets="slotProps">
            <slot name="presets" v-bind="slotProps" />
          </template>
        </DateRangePickerPanel>
      </Popover>
    </slot>
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
.drp-date-range-input-wrapper {
  display: inline-block;
}
</style>
