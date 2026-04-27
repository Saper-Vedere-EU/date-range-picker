import type { DateRangePickerMessages } from '@/messages'
import type { DateRangePickerTheme } from '@/theme'
import type { DateRangePickerPresets } from '@/components/molecules/PresetList'

export type DateRangePickerMode = 'inline' | 'input'

export interface DateRangePickerProps {
  start?: Date
  end?: Date
  locale?: string
  /** Override any subset of the default French labels. */
  messages?: Partial<DateRangePickerMessages>
  /**
   * Override any subset of the theme tokens. Unspecified tokens keep the
   * library defaults (see {@link DateRangePickerTheme}). Passed tokens are
   * applied as inline CSS custom properties on the root element, so they
   * cascade to every child and take precedence over stylesheet rules.
   */
  theme?: Partial<DateRangePickerTheme>
  /**
   * `inline` (default) renders the calendar directly in place.
   * `input` renders a masked text input that opens the calendar in a popover
   * when focused.
   */
  mode?: DateRangePickerMode
  /** Format of each date in `mode="input"`. Supports tokens `dd`, `MM`, `yyyy`. */
  inputFormat?: string
  /** Separator between the two dates in `mode="input"`. */
  inputSeparator?: string
  /** Placeholder for the text input in `mode="input"`. Defaults to the full template. */
  inputPlaceholder?: string
  /**
   * Optional one-click presets rendered alongside the calendars. Accepts a
   * flat list (single group) or an array of groups separated by visual
   * dividers. Each preset's `getRange()` is called on click; the picker is
   * placed in `selected` mode with that range and the calendars are reframed
   * onto it.
   */
  presets?: DateRangePickerPresets
}
