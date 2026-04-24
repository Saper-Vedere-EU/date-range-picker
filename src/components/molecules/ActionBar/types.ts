import type { PickerState } from '@/composables/useDateRangePicker/types'
import type { DateRangePickerMessages } from '@/messages'

export interface ActionBarProps {
  state: PickerState
  showViewSelection: boolean
  messages: Pick<DateRangePickerMessages, 'commit' | 'reset' | 'viewSelection'>
}
