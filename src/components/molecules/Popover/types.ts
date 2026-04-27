export interface PopoverProps {
  open: boolean
  /** Element the popover is positioned under. When `null`, the popover is not rendered. */
  anchor: HTMLElement | null
  /** Gap in pixels between the anchor's bottom edge and the popover. */
  offset?: number
}
