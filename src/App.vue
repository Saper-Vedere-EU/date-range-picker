<script setup lang="ts">
import { ref } from 'vue'
import { DateRangePicker } from './components/organisms/DateRangePicker'
import type { DateRangePickerMode, DateRangePickerTheme, DateRangePickerPreset } from './index'

const start = ref<Date | undefined>()
const end = ref<Date | undefined>()
const mode = ref<DateRangePickerMode>('inline')

const themes: Record<string, Partial<DateRangePickerTheme>> = {
  default: {},
  ocean: {
    accent: '#2563eb',
    bg: '#f8fafc',
    text: '#0f172a',
    mutedText: '#64748b',
    border: '#cbd5e1',
  },
  forest: {
    accent: '#059669',
    border: '#d1d5db',
  },
  dark: {
    accent: '#f472b6',
    bg: '#0b0b10',
    text: '#f4f4f5',
    mutedText: '#a1a1aa',
    border: '#27272a',
    onAccent: '#0b0b10',
  },
}

const current = ref<keyof typeof themes>('default')

function startOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}
function shift(d: Date, days: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}
function lastDays(n: number) {
  const today = startOfDay(new Date())
  return { start: shift(today, -(n - 1)), end: today }
}
function quarterStartMonth(month: number) {
  return Math.floor(month / 3) * 3 // 0-indexed
}

const presets: DateRangePickerPreset[][] = [
  [
    { title: '1 jour', getRange: () => lastDays(1) },
    { title: '7 derniers jours', getRange: () => lastDays(7) },
    { title: '14 derniers jours', getRange: () => lastDays(14) },
    { title: '30 derniers jours', getRange: () => lastDays(30) },
    { title: '365 derniers jours', getRange: () => lastDays(365) },
  ],
  [
    {
      title: 'Mois en cours',
      getRange: () => {
        const t = startOfDay(new Date())
        return {
          start: new Date(t.getFullYear(), t.getMonth(), 1),
          end: new Date(t.getFullYear(), t.getMonth() + 1, 0),
        }
      },
    },
    {
      title: 'Trimestre en cours',
      getRange: () => {
        const t = startOfDay(new Date())
        const qm = quarterStartMonth(t.getMonth())
        return {
          start: new Date(t.getFullYear(), qm, 1),
          end: new Date(t.getFullYear(), qm + 3, 0),
        }
      },
    },
    {
      title: 'Année en cours',
      getRange: () => {
        const t = startOfDay(new Date())
        return {
          start: new Date(t.getFullYear(), 0, 1),
          end: new Date(t.getFullYear(), 11, 31),
        }
      },
    },
  ],
  [
    {
      title: 'Dernier mois',
      getRange: () => {
        const t = startOfDay(new Date())
        return {
          start: new Date(t.getFullYear(), t.getMonth() - 1, 1),
          end: new Date(t.getFullYear(), t.getMonth(), 0),
        }
      },
    },
    {
      title: 'Dernier trimestre',
      getRange: () => {
        const t = startOfDay(new Date())
        const qm = quarterStartMonth(t.getMonth())
        return {
          start: new Date(t.getFullYear(), qm - 3, 1),
          end: new Date(t.getFullYear(), qm, 0),
        }
      },
    },
    {
      title: 'Dernière année',
      getRange: () => {
        const t = startOfDay(new Date())
        return {
          start: new Date(t.getFullYear() - 1, 0, 1),
          end: new Date(t.getFullYear() - 1, 11, 31),
        }
      },
    },
  ],
]
</script>

<template>
  <div id="demo">
    <h2>DateRangePicker Demo</h2>
    <div class="theme-switch">
      <button v-for="key in Object.keys(themes)" :key="key" @click="current = key">
        {{ key }}
      </button>
    </div>
    <div class="mode-switch">
      <label>
        <input type="radio" value="inline" v-model="mode" />
        inline
      </label>
      <label>
        <input type="radio" value="input" v-model="mode" />
        input
      </label>
    </div>
    <DateRangePicker
      v-model:start="start"
      v-model:end="end"
      :theme="themes[current]"
      :mode="mode"
      :presets="presets"
    >
      <!-- Demonstrates the #input slot: a fancy wrapped input replacing the default
           drp-input. In a real app this could be PrimeVue's <InputText />, Vuetify's
           <v-text-field />, etc. -->
      <template #input="{ value, onValueChange, onFocus, onBlur, onKeydown, attrs }">
        <label class="custom-input">
          <span class="custom-input__icon" aria-hidden="true">📅</span>
          <input
            class="custom-input__field"
            type="text"
            :value="value"
            @input="onValueChange(($event.target as HTMLInputElement).value)"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
            v-bind="attrs"
          />
        </label>
      </template>
    </DateRangePicker>
    <div class="debug">
      <p>
        <strong>Start:</strong>
        {{ start ? start.toLocaleDateString('fr-FR') : '—' }}
      </p>
      <p>
        <strong>End:</strong>
        {{ end ? end.toLocaleDateString('fr-FR') : '—' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
#demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px 24px;
}

.theme-switch {
  display: flex;
  gap: 8px;
}

.theme-switch button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  text-transform: capitalize;
}

.mode-switch {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.custom-input {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: linear-gradient(180deg, #fff, #fafafa);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.custom-input:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.custom-input__icon {
  font-size: 16px;
}

.custom-input__field {
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  min-width: 240px;
}

.debug {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--text);
}
</style>
