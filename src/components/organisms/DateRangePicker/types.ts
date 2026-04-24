import type { DateRangePickerMessages } from '@/messages'

export interface DateRangePickerProps {
  start?: Date
  end?: Date
  locale?: string
  /** Override any subset of the default French labels. */
  messages?: Partial<DateRangePickerMessages>
}
