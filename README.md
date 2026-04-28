# @saper-vedere/date-range-picker

A Vue 3 + TypeScript date range picker. Two-month calendar view, click-to-select, drag-to-adjust, optional input mode with popover, presets, theming via CSS custom properties, and full slot customisation.

- Vue 3.4+ (peer dependency, externalised from the bundle)
- TypeScript types included
- Single CSS file — no runtime style injection
- ESM + CJS builds

## Install

```sh
npm install @saper-vedere/date-range-picker
# or
yarn add @saper-vedere/date-range-picker
# or
pnpm add @saper-vedere/date-range-picker
```

Vue 3 must be installed in the host application.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateRangePicker } from '@saper-vedere/date-range-picker'
import '@saper-vedere/date-range-picker/style.css'

const start = ref<Date>()
const end = ref<Date>()
</script>

<template>
  <DateRangePicker v-model:start="start" v-model:end="end" />
</template>
```

`start` and `end` are independent v-models so you can bind only one if needed.

## Modes

### Inline (default)

Renders the two-calendar grid directly in place.

```vue
<DateRangePicker v-model:start="start" v-model:end="end" mode="inline" />
```

### Input

Renders a masked text input that opens the calendar in a popover when focused. Typing into the input parses partial dates as you go; pressing Enter commits and closes.

```vue
<DateRangePicker
  v-model:start="start"
  v-model:end="end"
  mode="input"
  input-format="dd/MM/yyyy"
  input-separator=" - "
/>
```

Format tokens supported: `dd`, `MM`, `yyyy`.

## Props

| Prop              | Type                                      | Default          | Description                                                                                              |
| ----------------- | ----------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `start`           | `Date \| undefined`                       | —                | v-model. Committed range start.                                                                          |
| `end`             | `Date \| undefined`                       | —                | v-model. Committed range end.                                                                            |
| `locale`          | `string`                                  | `'fr-FR'`        | BCP-47 locale used for month names and weekday abbreviations.                                            |
| `messages`        | `Partial<DateRangePickerMessages>`        | `{}`             | Override any subset of the default UI labels (button text, nav `aria-label`s).                           |
| `theme`           | `Partial<DateRangePickerTheme>`           | `{}`             | Override theme tokens; merged over the CSS defaults and applied as inline `--drp-*` variables.           |
| `mode`            | `'inline' \| 'input'`                     | `'inline'`       | Render the calendar in place or behind a text input + popover.                                           |
| `inputFormat`     | `string`                                  | `'dd/MM/yyyy'`   | Date format for `mode="input"`. Tokens: `dd`, `MM`, `yyyy`.                                              |
| `inputSeparator`  | `string`                                  | `' - '`          | Separator between the two dates in the input.                                                            |
| `inputPlaceholder`| `string`                                  | derived          | Placeholder for the text input. Defaults to the full template (e.g. `dd/MM/yyyy - dd/MM/yyyy`).          |
| `presets`         | `DateRangePickerPresets`                  | `[]`             | One-click range presets. Either a flat array or an array of groups (rendered as visually-separated lists).|

## Theming

The library declares its design tokens as CSS custom properties on the root element with `:where(.drp-@saper-vedere/date-range-picker)` (zero specificity), so any of the following mechanisms work:

**1. Pass a partial `theme` object** — applied as inline CSS variables, takes precedence:

```vue
<DateRangePicker
  v-model:start="start"
  v-model:end="end"
  :theme="{ accent: '#2563eb', bg: '#f8fafc', text: '#0f172a' }"
/>
```

**2. Override via stylesheet** — load after `style.css`:

```css
.drp-@saper-vedere/date-range-picker {
  --drp-accent: #2563eb;
  --drp-bg: #f8fafc;
}
```

Available tokens (see `DateRangePickerTheme`):

| Token             | CSS variable             | Purpose                                                |
| ----------------- | ------------------------ | ------------------------------------------------------ |
| `accent`          | `--drp-accent`           | Selected dates, primary buttons.                       |
| `accentPressed`   | `--drp-accent-pressed`   | Pressed state of selected cells.                       |
| `accentSubtle`    | `--drp-accent-subtle`    | Hover and in-range tint.                               |
| `accentMuted`     | `--drp-accent-muted`     | Pressed in-range cell.                                 |
| `accentEmphasis`  | `--drp-accent-emphasis`  | Stronger pressed in-range tint.                        |
| `accentBorder`    | `--drp-accent-border`    | "Today" marker border.                                 |
| `onAccent`        | `--drp-on-accent`        | Foreground on top of `accent`.                         |
| `bg`              | `--drp-bg`               | Container background.                                  |
| `text`            | `--drp-text`             | Primary text.                                          |
| `mutedText`       | `--drp-muted-text`       | Secondary text (weekday abbreviations).                |
| `border`          | `--drp-border`           | Container and button borders.                          |
| `font`            | `--drp-font`             | Font family stack.                                     |

The full default theme is exported as `defaultTheme` for inspection.

## Localisation

Two independent channels:

- **Locale-formatted content** (month names, weekday abbreviations) — set the `locale` prop.
- **Static UI labels** (action buttons, nav arrow `aria-label`s) — pass `messages`.

```vue
<DateRangePicker
  v-model:start="start"
  v-model:end="end"
  locale="en-US"
  :messages="{
    commit: 'Apply',
    reset: 'Reset',
    viewSelection: 'View selection',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
  }"
/>
```

Defaults are French (see `defaultMessages` exported from the package). All keys are optional — provide only the ones you want to override.

## Presets

Render one-click range shortcuts alongside the calendar. Each preset's `getRange()` is called on click; the picker enters the `selected` state with that range and reframes the calendars onto it (the user still confirms via the action bar, or you can wire `mode="input"` so committing closes the popover).

```ts
import type { DateRangePickerPresets } from '@saper-vedere/date-range-picker'

const presets: DateRangePickerPresets = [
  // First group
  [
    { title: 'Last 7 days', getRange: () => ({ start: ..., end: ... }) },
    { title: 'Last 30 days', getRange: () => ({ start: ..., end: ... }) },
  ],
  // Second group, separated by a divider
  [
    { title: 'This month', getRange: () => ({ start: ..., end: ... }) },
    { title: 'This year', getRange: () => ({ start: ..., end: ... }) },
  ],
]
```

A flat array (no nesting) is also accepted and rendered as a single group.

## Slots

| Slot         | Bindings                                                                              | Purpose                                                                                |
| ------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `nav-prev`   | `{ onClick }`                                                                         | Replace the previous-month arrow.                                                      |
| `nav-next`   | `{ onClick }`                                                                         | Replace the next-month arrow.                                                          |
| `action-bar` | `{ state, showViewSelection, onCommit, onReset, onViewSelection }`                    | Replace the bottom action bar.                                                         |
| `input`      | `DateRangeInputSlotBindings` (`value`, `onValueChange`, `onFocus`, `onBlur`, `onKeydown`, `attrs`) | Replace the text input in `mode="input"`. Wire the bindings to your component. |
| `presets`    | `{ groups, onSelect }`                                                                | Replace the preset list rendering.                                                     |

### Custom input example

```vue
<DateRangePicker v-model:start="start" v-model:end="end" mode="input">
  <template #input="{ value, onValueChange, onFocus, onBlur, onKeydown, attrs }">
    <input
      :value="value"
      @input="onValueChange(($event.target as HTMLInputElement).value)"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      v-bind="attrs"
    />
  </template>
</DateRangePicker>
```

## Public API

```ts
import {
  DateRangePicker,
  Button,
  defaultMessages,
  defaultTheme,
  themeToCssVars,
  type DateRangePickerProps,
  type DateRangePickerMode,
  type DateRangePickerMessages,
  type DateRangePickerTheme,
  type DateRangePickerPreset,
  type DateRangePickerPresets,
  type DateRangeInputSlotBindings,
  type PickerState,
  type YearMonth,
  type DayInfo,
  type MonthGrid,
} from '@saper-vedere/date-range-picker'
```

## Development

```sh
yarn dev         # local demo at /src/App.vue
yarn build       # build the library to dist/
yarn typecheck   # vue-tsc
yarn test        # vitest run
```

## License

MIT
