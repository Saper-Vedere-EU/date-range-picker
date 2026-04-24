import type { DateRangePickerMessages } from '@/messages'
import type { DateRangePickerTheme } from '@/theme'

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
}
