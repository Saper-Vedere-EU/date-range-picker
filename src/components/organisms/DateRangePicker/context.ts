import type { ComputedRef, InjectionKey } from 'vue'
import type { PickerState, YearMonth, MonthGrid } from '@/composables/useDateRangePicker'
import type { DateRangePickerMessages } from '@/messages'
import type { DateRangePickerPreset } from '@/components/molecules/PresetList'

/**
 * Shared state and handlers exposed by `<DateRangePicker>` to its descendant
 * `<DateRangePickerPanel>` via provide/inject. This decouples the panel from
 * how it is wrapped (inline, internal popover, or a consumer-supplied popover
 * passed through the `popover` slot).
 */
export interface DateRangePickerContext {
  locale: ComputedRef<string>
  messages: ComputedRef<DateRangePickerMessages>
  themeStyle: ComputedRef<Record<string, string>>

  mode: ComputedRef<PickerState>
  leftMonth: ComputedRef<YearMonth>
  rightMonth: ComputedRef<YearMonth>
  leftGrid: ComputedRef<MonthGrid>
  rightGrid: ComputedRef<MonthGrid>
  showViewSelection: ComputedRef<boolean>
  monthPickerSide: ComputedRef<'left' | 'right' | null>
  yearPickerSide: ComputedRef<'left' | 'right' | null>
  yearPickerBaseYear: ComputedRef<number>
  dragSourceSide: ComputedRef<'left' | 'right' | null>

  presetGroups: ComputedRef<DateRangePickerPreset[][]>
  hasPresets: ComputedRef<boolean>
  onSelectPreset: (preset: DateRangePickerPreset) => void

  selectDay: (date: Date) => void
  navigatePrev: () => void
  navigateNext: () => void
  onCommit: () => void
  reset: () => void
  viewSelection: () => void
  openMonthPicker: (side: 'left' | 'right') => void
  selectMonth: (side: 'left' | 'right', month: number) => void
  openYearPicker: (side: 'left' | 'right') => void
  selectYear: (side: 'left' | 'right', year: number) => void
  startDragEndpoint: (endpoint: 'start' | 'end') => void
  updateDragHover: (date: Date) => void
  commitDrag: () => void
  cancelDrag: () => void
  pageSourcePrev: () => void
  pageSourceNext: () => void
}

export const dateRangePickerContextKey: InjectionKey<DateRangePickerContext> = Symbol(
  'dateRangePickerContext',
)
