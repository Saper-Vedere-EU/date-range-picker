<script setup lang="ts">
import { ref } from 'vue'
import { DateRangePicker } from './components/organisms/DateRangePicker'
import type { DateRangePickerTheme } from './theme'

const start = ref<Date | undefined>()
const end = ref<Date | undefined>()

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
</script>

<template>
  <div id="demo">
    <h2>DateRangePicker Demo</h2>
    <div class="theme-switch">
      <button v-for="key in Object.keys(themes)" :key="key" @click="current = key">
        {{ key }}
      </button>
    </div>
    <DateRangePicker
      v-model:start="start"
      v-model:end="end"
      :theme="themes[current]"
    ></DateRangePicker>
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

.debug {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--text);
}
</style>
