<script lang="ts" setup>
import type { CalendarMonthProps } from "./types";
import { CalendarMonthHeader } from "@/components/atoms/CalendarMonthHeader";
import { CalendarWeekdayRow } from "@/components/atoms/CalendarWeekdayRow";
import { CalendarDay } from "@/components/atoms/CalendarDay";

withDefaults(defineProps<CalendarMonthProps>(), {
  locale: "fr-FR",
});

const emit = defineEmits<{ "select-day": [date: Date] }>();
</script>

<template>
  <div class="drp-calendar-month">
    <CalendarMonthHeader :year="year" :month="month" :locale="locale" />
    <CalendarWeekdayRow :locale="locale" />
    <div v-for="(week, wi) in grid" :key="wi" class="drp-week-row">
      <CalendarDay
        v-for="(day, di) in week"
        :key="di"
        :day="day.dayOfMonth"
        :is-today="day.isToday"
        :is-outside-month="day.isOutsideMonth"
        :is-selected="day.isSelected"
        :is-range-start="day.isRangeStart"
        :is-range-end="day.isRangeEnd"
        :is-in-range="day.isInRange"
        :is-disabled="day.isDisabled"
        @click="emit('select-day', day.date)"
      />
    </div>
  </div>
</template>

<style scoped>
.drp-calendar-month {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drp-week-row {
  display: grid;
  grid-template-columns: repeat(7, 36px);
  gap: 2px;
}
</style>
