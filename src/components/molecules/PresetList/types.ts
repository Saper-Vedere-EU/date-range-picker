export interface DateRangePickerPreset {
  /** Label rendered on the preset button. */
  title: string
  /** Returns the range to apply when the preset is clicked. */
  getRange: () => { start: Date; end: Date }
}

/**
 * A flat list (one group) or a list of groups separated by visual dividers.
 * Empty inner groups are skipped.
 */
export type DateRangePickerPresets = DateRangePickerPreset[] | DateRangePickerPreset[][]

export interface PresetListProps {
  /** Already normalised to groups by the parent. */
  groups: DateRangePickerPreset[][]
}
