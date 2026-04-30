<script lang="ts" setup>
import { computed } from 'vue'
import type { DateRangePickerPreset, PresetListProps } from './types'

const props = defineProps<PresetListProps>()
const emit = defineEmits<{
  select: [preset: DateRangePickerPreset]
}>()

const nonEmptyGroups = computed(() => props.groups.filter((g) => g.length > 0))
</script>

<template>
  <div class="drp-preset-list">
    <div class="drp-preset-list__scroll">
      <template v-for="(group, gIndex) in nonEmptyGroups" :key="gIndex">
        <hr v-if="gIndex > 0" class="drp-preset-list__separator" />
        <ul class="drp-preset-list__group">
          <li v-for="(preset, pIndex) in group" :key="pIndex" class="drp-preset-list__item">
            <button type="button" class="drp-preset-btn" @click="emit('select', preset)">
              {{ preset.title }}
            </button>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.drp-preset-list {
  /*
   * Outer wrapper: lets the column match the panel's height via flex
   * `align-self: stretch` (the panel sets `align-items: stretch`). The inner
   * `__scroll` uses `flex: 1 1 0` so its content does NOT contribute to this
   * column's intrinsic block size — the panel's height is therefore driven by
   * the calendar, not by the number of presets.
   */
  display: flex;
  flex-direction: column;
  padding: 0 12px 0 0;
  border-right: 1px solid var(--drp-border);
  min-height: 0;
}

.drp-preset-list__scroll {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.drp-preset-list__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.drp-preset-list__item {
  margin: 0;
}

.drp-preset-list__separator {
  margin: 0;
  border: none;
  border-top: 1px solid var(--drp-border);
}

.drp-preset-btn {
  width: 100%;
  text-align: left;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--drp-text);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.drp-preset-btn:hover {
  background: var(--drp-accent-subtle);
}

.drp-preset-btn:focus-visible {
  outline: none;
  border-color: var(--drp-accent-border);
}
</style>
