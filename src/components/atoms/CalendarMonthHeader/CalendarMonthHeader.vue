<script lang="ts" setup>
import { computed } from "vue";
import type { CalendarMonthHeaderProps } from "./types";
import { getMonthName } from "@/composables/useDateRangePicker/calendar-utils";

const props = withDefaults(defineProps<CalendarMonthHeaderProps>(), {
  locale: "fr-FR",
});

const emit = defineEmits<{ click: [] }>();

const label = computed(() => {
  const name = getMonthName(props.month, props.locale);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${props.year}`;
});
</script>

<template>
  <button type="button" class="drp-month-header" @click="emit('click')">
    {{ label }}
  </button>
</template>

<style scoped>
.drp-month-header {
  font-size: 15px;
  font-weight: 600;
  color: var(--drp-text, var(--text-h, #08060d));
  text-align: center;
  padding: 8px 0;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s;
  width: 100%;
}

.drp-month-header:hover {
  background: var(
    --drp-day-hover-bg,
    var(--accent-bg, rgba(170, 59, 255, 0.1))
  );
}
</style>
