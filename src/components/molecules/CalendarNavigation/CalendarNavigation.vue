<script lang="ts" setup>
import type { CalendarNavigationProps } from "./types";
import { NavArrow } from "@/components/atoms/NavArrow";
import { CalendarMonth } from "@/components/molecules/CalendarMonth";

withDefaults(defineProps<CalendarNavigationProps>(), {
  locale: "fr-FR",
  monthPickerSide: null,
});

const emit = defineEmits<{
  prev: [];
  next: [];
  "select-day": [date: Date];
  "click-month-header": [side: "left" | "right"];
  "select-month": [side: "left" | "right", month: number];
}>();
</script>

<template>
  <div class="drp-calendar-navigation">
    <NavArrow direction="left" @click="emit('prev')" />
    <CalendarMonth
      :year="leftYear"
      :month="leftMonth"
      :grid="leftGrid"
      :locale="locale"
      :month-picker-open="monthPickerSide === 'left'"
      @select-day="(date) => emit('select-day', date)"
      @click-header="emit('click-month-header', 'left')"
      @select-month="(m) => emit('select-month', 'left', m)"
    />
    <CalendarMonth
      :year="rightYear"
      :month="rightMonth"
      :grid="rightGrid"
      :locale="locale"
      :month-picker-open="monthPickerSide === 'right'"
      @select-day="(date) => emit('select-day', date)"
      @click-header="emit('click-month-header', 'right')"
      @select-month="(m) => emit('select-month', 'right', m)"
    />
    <NavArrow direction="right" @click="emit('next')" />
  </div>
</template>

<style scoped>
.drp-calendar-navigation {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.drp-calendar-navigation > .drp-nav-arrow {
  margin-top: 8px;
}
</style>
