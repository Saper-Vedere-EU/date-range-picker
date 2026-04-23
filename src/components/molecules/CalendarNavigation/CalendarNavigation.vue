<script lang="ts" setup>
import type { CalendarNavigationProps } from "./types";
import { NavArrow } from "@/components/atoms/NavArrow";
import { CalendarMonth } from "@/components/molecules/CalendarMonth";

withDefaults(defineProps<CalendarNavigationProps>(), {
  locale: "fr-FR",
});

const emit = defineEmits<{
  prev: [];
  next: [];
  "select-day": [date: Date];
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
      @select-day="(date) => emit('select-day', date)"
    />
    <CalendarMonth
      :year="rightYear"
      :month="rightMonth"
      :grid="rightGrid"
      :locale="locale"
      @select-day="(date) => emit('select-day', date)"
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
