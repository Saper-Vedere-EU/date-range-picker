<script lang="ts" setup>
import { CalendarNavigation } from "@/components/molecules/CalendarNavigation";
import { ActionBar } from "@/components/molecules/ActionBar";
import { useDateRangePicker } from "@/composables/useDateRangePicker";

const start = defineModel<Date | undefined>("start");
const end = defineModel<Date | undefined>("end");

withDefaults(
  defineProps<{
    locale?: string;
  }>(),
  { locale: "fr-FR" },
);

const {
  mode,
  leftMonth,
  rightMonth,
  leftGrid,
  rightGrid,
  showViewSelection,
  monthPickerSide,
  yearPickerSide,
  yearPickerBaseYear,
  selectDay,
  navigatePrev,
  navigateNext,
  commit,
  reset,
  viewSelection,
  openMonthPicker,
  selectMonth,
  openYearPicker,
  selectYear,
  dragSourceSide,
  startDragEndpoint,
  updateDragHover,
  commitDrag,
  cancelDrag,
  pageSourcePrev,
  pageSourceNext,
} = useDateRangePicker({
  committedStart: start,
  committedEnd: end,
});
</script>

<template>
  <div class="drp-date-range-picker">
    <CalendarNavigation
      :left-year="leftMonth.year"
      :left-month="leftMonth.month"
      :left-grid="leftGrid"
      :right-year="rightMonth.year"
      :right-month="rightMonth.month"
      :right-grid="rightGrid"
      :locale="locale"
      :month-picker-side="monthPickerSide"
      :year-picker-side="yearPickerSide"
      :year-picker-base-year="yearPickerBaseYear"
      :drag-source-side="dragSourceSide"
      @prev="navigatePrev"
      @next="navigateNext"
      @select-day="selectDay"
      @click-month-header="openMonthPicker"
      @click-year-header="openYearPicker"
      @select-month="selectMonth"
      @select-year="selectYear"
      @drag-start-endpoint="startDragEndpoint"
      @drag-hover="updateDragHover"
      @drag-drop="commitDrag"
      @drag-end="cancelDrag"
      @auto-page-prev="pageSourcePrev"
      @auto-page-next="pageSourceNext"
    />
    <ActionBar
      :state="mode"
      :show-view-selection="showViewSelection"
      @commit="commit"
      @reset="reset"
      @view-selection="viewSelection"
    />
  </div>
</template>

<style scoped>
.drp-date-range-picker {
  display: inline-flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--drp-border, var(--border, #e5e4e7));
  border-radius: 12px;
  background: var(--drp-bg, var(--bg, #fff));
  font-family: var(--drp-font, var(--sans, system-ui, 'Segoe UI', Roboto, sans-serif));
}
</style>
