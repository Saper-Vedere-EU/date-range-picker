<script lang="ts" setup>
import { computed } from 'vue'
import type { CalendarWeekdayRowProps } from './types'
import { getWeekdayNames } from '@/composables/useDateRangePicker/calendar-utils'

const props = withDefaults(defineProps<CalendarWeekdayRowProps>(), {
  locale: 'fr-FR',
})

const weekdays = computed(() => getWeekdayNames(props.locale))
</script>

<template>
  <div class="drp-weekday-row">
    <span v-for="name in weekdays" :key="name" class="drp-weekday">
      {{ name }}
    </span>
  </div>
</template>

<style scoped>
.drp-weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 36px);
  gap: 2px;
  text-align: center;
  padding-bottom: 4px;
}

.drp-weekday {
  font-size: 12px;
  font-weight: 500;
  color: var(--drp-weekday-color, var(--text, #6b6375));
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}
</style>
