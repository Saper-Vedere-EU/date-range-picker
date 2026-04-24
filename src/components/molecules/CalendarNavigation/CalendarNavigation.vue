<script lang="ts" setup>
import type { CalendarNavigationProps } from "./types";
import { NavArrow } from "@/components/atoms/NavArrow";
import { CalendarMonth } from "@/components/molecules/CalendarMonth";

withDefaults(defineProps<CalendarNavigationProps>(), {
  locale: "fr-FR",
  monthPickerSide: null,
  yearPickerSide: null,
});

const emit = defineEmits<{
  prev: [];
  next: [];
  "select-day": [date: Date];
  "click-month-header": [side: "left" | "right"];
  "click-year-header": [side: "left" | "right"];
  "select-month": [side: "left" | "right", month: number];
  "select-year": [side: "left" | "right", year: number];
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
      :year-picker-open="yearPickerSide === 'left'"
      :year-picker-base-year="yearPickerBaseYear"
      @select-day="(date: Date) => emit('select-day', date)"
      @click-month-header="emit('click-month-header', 'left')"
      @click-year-header="emit('click-year-header', 'left')"
      @select-month="(m: number) => emit('select-month', 'left', m)"
      @select-year="(y: number) => emit('select-year', 'left', y)"
    />
    <CalendarMonth
      :year="rightYear"
      :month="rightMonth"
      :grid="rightGrid"
      :locale="locale"
      :month-picker-open="monthPickerSide === 'right'"
      :year-picker-open="yearPickerSide === 'right'"
      :year-picker-base-year="yearPickerBaseYear"
      @select-day="(date: Date) => emit('select-day', date)"
      @click-month-header="emit('click-month-header', 'right')"
      @click-year-header="emit('click-year-header', 'right')"
      @select-month="(m: number) => emit('select-month', 'right', m)"
      @select-year="(y: number) => emit('select-year', 'right', y)"
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
