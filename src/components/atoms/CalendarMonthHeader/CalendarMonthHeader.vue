<script lang="ts" setup>
import { computed } from "vue";
import type { CalendarMonthHeaderProps } from "./types";
import { getMonthName } from "@/composables/useDateRangePicker/calendar-utils";

const props = withDefaults(defineProps<CalendarMonthHeaderProps>(), {
  locale: "fr-FR",
});

const label = computed(() => {
  const name = getMonthName(props.month, props.locale);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${props.year}`;
});
</script>

<template>
  <div class="drp-month-header">{{ label }}</div>
</template>

<style scoped>
.drp-month-header {
  font-size: 15px;
  font-weight: 600;
  color: var(--drp-text, var(--text-h, #08060d));
  text-align: center;
  padding: 8px 0;
}
</style>
