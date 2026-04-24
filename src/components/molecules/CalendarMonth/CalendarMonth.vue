<script lang="ts" setup>
import { computed } from "vue";
import type { CalendarMonthProps } from "./types";
import { CalendarMonthHeader } from "@/components/atoms/CalendarMonthHeader";
import { CalendarWeekdayRow } from "@/components/atoms/CalendarWeekdayRow";
import { CalendarDay } from "@/components/atoms/CalendarDay";
import { CalendarMonthCell } from "@/components/atoms/CalendarMonthCell";
import { CalendarYearCell } from "@/components/atoms/CalendarYearCell";
import { getMonthShortName } from "@/composables/useDateRangePicker/calendar-utils";

const props = withDefaults(defineProps<CalendarMonthProps>(), {
  locale: "fr-FR",
  monthPickerOpen: false,
  yearPickerOpen: false,
});

const emit = defineEmits<{
  "select-day": [date: Date];
  "select-month": [month: number];
  "select-year": [year: number];
  "click-month-header": [];
  "click-year-header": [];
  "drag-start-endpoint": [endpoint: "start" | "end"];
  "drag-hover": [date: Date];
  drop: [];
  "drag-end": [];
}>();

const monthCells = computed(() => {
  const cells: { month: number; label: string; isCurrent: boolean }[] = [];
  for (let m = 1; m <= 12; m++) {
    const raw = getMonthShortName(m, props.locale);
    cells.push({
      month: m,
      label: raw.charAt(0).toUpperCase() + raw.slice(1),
      isCurrent: m === props.month,
    });
  }
  return cells;
});

const yearCells = computed(() => {
  const base = props.yearPickerBaseYear ?? props.year;
  const cells: { year: number; isCurrent: boolean }[] = [];
  for (let i = 0; i < 12; i++) {
    const y = base + i;
    cells.push({ year: y, isCurrent: y === props.year });
  }
  return cells;
});
</script>

<template>
  <div class="drp-calendar-month">
    <CalendarMonthHeader
      :year="year"
      :month="month"
      :locale="locale"
      @click-month="emit('click-month-header')"
      @click-year="emit('click-year-header')"
    />

    <template v-if="yearPickerOpen">
      <div class="drp-year-grid">
        <CalendarYearCell
          v-for="cell in yearCells"
          :key="cell.year"
          :year="cell.year"
          :is-current="cell.isCurrent"
          @click="(y: number) => emit('select-year', y)"
        />
      </div>
    </template>

    <template v-else-if="monthPickerOpen">
      <div class="drp-month-grid">
        <CalendarMonthCell
          v-for="cell in monthCells"
          :key="cell.month"
          :month="cell.month"
          :label="cell.label"
          :is-current="cell.isCurrent"
          @click="(m: number) => emit('select-month', m)"
        />
      </div>
    </template>

    <template v-else>
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
          @drag-start-endpoint="
            (endpoint: 'start' | 'end') =>
              emit('drag-start-endpoint', endpoint)
          "
          @drag-enter="emit('drag-hover', day.date)"
          @drop="emit('drop')"
          @drag-end="emit('drag-end')"
        />
      </div>
    </template>
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

.drp-month-grid,
.drp-year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2px;
  width: 264px;
  height: 260px;
}
</style>
