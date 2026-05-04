import type { PickerState } from '@/composables/useDateRangePicker'
import type { DateRangePickerPreset } from '@/components/molecules/PresetList'

export interface DateRangePickerPanelNavSlotProps {
  onClick: () => void
}

export interface DateRangePickerPanelActionBarSlotProps {
  state: PickerState
  showViewSelection: boolean
  onCommit: () => void
  onReset: () => void
  onViewSelection: () => void
}

export interface DateRangePickerPanelPresetsSlotProps {
  groups: DateRangePickerPreset[][]
  /** Current effective start date — `null` when no range is active. */
  currentStart: Date | null
  /** Current effective end date — `null` when no range is active. */
  currentEnd: Date | null
  onSelect: (preset: DateRangePickerPreset) => void
}
