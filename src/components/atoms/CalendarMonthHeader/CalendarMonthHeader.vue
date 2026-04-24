<script lang="ts" setup>
import { computed } from "vue";
import type { CalendarMonthHeaderProps } from "./types";
import { getMonthName } from "@/composables/useDateRangePicker/calendar-utils";

const props = withDefaults(defineProps<CalendarMonthHeaderProps>(), {
  locale: "fr-FR",
});

const emit = defineEmits<{
  "click-month": [];
  "click-year": [];
}>();

const monthLabel = computed(() => {
  const name = getMonthName(props.month, props.locale);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
});
</script>

<template>
  <div class="drp-month-header">
    <button
      type="button"
      class="drp-month-header__btn drp-month-header__btn--month"
      @click="emit('click-month')"
    >
      {{ monthLabel }}
    </button>
    <button
      type="button"
      class="drp-month-header__btn drp-month-header__btn--year"
      @click="emit('click-year')"
    >
      {{ year }}
    </button>
  </div>
</template>

<style scoped>
.drp-month-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.drp-month-header__btn {
  font-size: 15px;
  font-weight: 600;
  color: var(--drp-text, var(--text-h, #08060d));
  text-align: center;
  padding: 8px 6px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s;
}

.drp-month-header__btn:hover {
  background: var(
    --drp-day-hover-bg,
    var(--accent-bg, rgba(170, 59, 255, 0.1))
  );
}
</style>
