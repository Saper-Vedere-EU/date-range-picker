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
  onSelect: (preset: DateRangePickerPreset) => void
}
