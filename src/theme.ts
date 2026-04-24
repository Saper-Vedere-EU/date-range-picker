export interface DateRangePickerTheme {
  /** Primary brand color, used for selected dates and primary buttons. */
  accent: string
  /** Darker variant of `accent`, shown when a selected cell is being pressed. */
  accentPressed: string
  /** Subtle accent tint, used for hover states and dates inside the range. */
  accentSubtle: string
  /** Slightly stronger accent tint, used when a day cell is pressed. */
  accentMuted: string
  /** Stronger accent tint, used when an in-range cell is pressed. */
  accentEmphasis: string
  /** Accent color at ~50% alpha, used for the "today" marker border. */
  accentBorder: string
  /** Foreground color on top of `accent` (e.g. selected day label). */
  onAccent: string
  /** Surface / container background. */
  bg: string
  /** Primary text color (days, month/year headers). */
  text: string
  /** Secondary text color (weekday abbreviations). */
  mutedText: string
  /** Container and button border color. */
  border: string
  /** Font family stack. */
  font: string
}

/**
 * Reference defaults that match the CSS baked into the library stylesheet.
 * Useful when inspecting or reasoning about the theme programmatically — you
 * generally do NOT need to spread this object when overriding a few tokens,
 * because unspecified tokens fall back to the CSS defaults automatically.
 */
export const defaultTheme: DateRangePickerTheme = {
  accent: '#aa3bff',
  accentPressed: 'color-mix(in srgb, #aa3bff 75%, #000)',
  accentSubtle: 'color-mix(in srgb, #aa3bff 10%, transparent)',
  accentMuted: 'color-mix(in srgb, #aa3bff 25%, transparent)',
  accentEmphasis: 'color-mix(in srgb, #aa3bff 30%, transparent)',
  accentBorder: 'color-mix(in srgb, #aa3bff 50%, transparent)',
  onAccent: '#fff',
  bg: '#fff',
  text: '#08060d',
  mutedText: '#6b6375',
  border: '#e5e4e7',
  font: "system-ui, 'Segoe UI', Roboto, sans-serif",
}

const TOKEN_TO_CSS_VAR: Record<keyof DateRangePickerTheme, string> = {
  accent: '--drp-accent',
  accentPressed: '--drp-accent-pressed',
  accentSubtle: '--drp-accent-subtle',
  accentMuted: '--drp-accent-muted',
  accentEmphasis: '--drp-accent-emphasis',
  accentBorder: '--drp-accent-border',
  onAccent: '--drp-on-accent',
  bg: '--drp-bg',
  text: '--drp-text',
  mutedText: '--drp-muted-text',
  border: '--drp-border',
  font: '--drp-font',
}

/**
 * Convert a partial theme object to an inline `style` binding mapping each
 * provided token to its corresponding `--drp-*` CSS custom property.
 */
export function themeToCssVars(
  theme: Partial<DateRangePickerTheme> | undefined,
): Record<string, string> {
  if (!theme) return {}
  const style: Record<string, string> = {}
  for (const key of Object.keys(theme) as (keyof DateRangePickerTheme)[]) {
    const value = theme[key]
    if (value !== undefined) style[TOKEN_TO_CSS_VAR[key]] = value
  }
  return style
}
