export interface DateRangeInputProps {
  start: Date | undefined
  end: Date | undefined
  /** Format of each date. Supports tokens `dd`, `MM`, `yyyy`. */
  format?: string
  /** Separator inserted between the two dates in the input. */
  separator?: string
  /** Placeholder shown when the input is empty. Defaults to the full template. */
  placeholder?: string
  /** Accessible label for the input. */
  ariaLabel?: string
}

/**
 * Bindings exposed by the `DateRangeInput` default slot (and re-exposed by the
 * `DateRangePicker` `input` slot). Wire `value` and `onValueChange` to your
 * component's v-model, forward `onFocus`/`onBlur`/`onKeydown` so the popover
 * stays in sync, and spread `attrs` for placeholder/maxlength/aria-label.
 */
export interface DateRangeInputSlotBindings {
  /** Current display text (already mask-formatted). */
  value: string
  /** Call with the raw text whenever the underlying input changes. */
  onValueChange: (next: string) => void
  /** Forward the input's focus event so the popover can open. */
  onFocus: () => void
  /** Forward the input's blur event so invalid input is reverted. */
  onBlur: () => void
  /** Forward the input's keydown event so Enter commits & closes. */
  onKeydown: (e: KeyboardEvent) => void
  /** Static HTML attributes ready to spread onto the underlying input. */
  attrs: {
    placeholder: string
    maxlength: number
    'aria-label'?: string
  }
}
