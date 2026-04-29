<script lang="ts" setup>
import { inject } from 'vue'
import { CalendarNavigation } from '@/components/molecules/CalendarNavigation'
import { ActionBar } from '@/components/molecules/ActionBar'
import { PresetList } from '@/components/molecules/PresetList'
import { dateRangePickerContextKey } from '@/components/organisms/DateRangePicker/context'
import type {
  DateRangePickerPanelNavSlotProps,
  DateRangePickerPanelActionBarSlotProps,
  DateRangePickerPanelPresetsSlotProps,
} from './types'

defineSlots<{
  'nav-prev'(props: DateRangePickerPanelNavSlotProps): unknown
  'nav-next'(props: DateRangePickerPanelNavSlotProps): unknown
  'action-bar'(props: DateRangePickerPanelActionBarSlotProps): unknown
  presets(props: DateRangePickerPanelPresetsSlotProps): unknown
}>()

const ctx = inject(dateRangePickerContextKey)
if (!ctx) {
  throw new Error(
    '<DateRangePickerPanel> must be used inside <DateRangePicker> — no picker context was provided.',
  )
}
</script>

<template>
  <div class="drp-date-range-picker" :style="ctx.themeStyle.value">
    <slot
      v-if="ctx.hasPresets.value"
      name="presets"
      :groups="ctx.presetGroups.value"
      :on-select="ctx.onSelectPreset"
    >
      <PresetList :groups="ctx.presetGroups.value" @select="ctx.onSelectPreset" />
    </slot>
    <div class="drp-date-range-picker__main">
      <CalendarNavigation
        :left-year="ctx.leftMonth.value.year"
        :left-month="ctx.leftMonth.value.month"
        :left-grid="ctx.leftGrid.value"
        :right-year="ctx.rightMonth.value.year"
        :right-month="ctx.rightMonth.value.month"
        :right-grid="ctx.rightGrid.value"
        :messages="ctx.messages.value"
        :locale="ctx.locale.value"
        :month-picker-side="ctx.monthPickerSide.value"
        :year-picker-side="ctx.yearPickerSide.value"
        :year-picker-base-year="ctx.yearPickerBaseYear.value"
        :drag-source-side="ctx.dragSourceSide.value"
        @prev="ctx.navigatePrev"
        @next="ctx.navigateNext"
        @select-day="ctx.selectDay"
        @click-month-header="ctx.openMonthPicker"
        @click-year-header="ctx.openYearPicker"
        @select-month="ctx.selectMonth"
        @select-year="ctx.selectYear"
        @drag-start-endpoint="ctx.startDragEndpoint"
        @drag-hover="ctx.updateDragHover"
        @drag-drop="ctx.commitDrag"
        @drag-end="ctx.cancelDrag"
        @auto-page-prev="ctx.pageSourcePrev"
        @auto-page-next="ctx.pageSourceNext"
      >
        <template v-if="$slots['nav-prev']" #nav-prev="slotProps">
          <slot name="nav-prev" v-bind="slotProps" />
        </template>
        <template v-if="$slots['nav-next']" #nav-next="slotProps">
          <slot name="nav-next" v-bind="slotProps" />
        </template>
      </CalendarNavigation>
      <slot
        name="action-bar"
        :state="ctx.mode.value"
        :show-view-selection="ctx.showViewSelection.value"
        :on-commit="ctx.onCommit"
        :on-reset="ctx.reset"
        :on-view-selection="ctx.viewSelection"
      >
        <ActionBar
          :state="ctx.mode.value"
          :show-view-selection="ctx.showViewSelection.value"
          :messages="ctx.messages.value"
          @commit="ctx.onCommit"
          @reset="ctx.reset"
          @view-selection="ctx.viewSelection"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.drp-date-range-picker {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--drp-border);
  border-radius: 12px;
  background: var(--drp-bg);
  font-family: var(--drp-font);
  color: var(--drp-text);
}

.drp-date-range-picker__main {
  display: flex;
  flex-direction: column;
}
</style>
