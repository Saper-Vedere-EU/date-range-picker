<script lang="ts" setup>
import type { ActionBarProps } from './types'

defineProps<ActionBarProps>()
const emit = defineEmits<{
  commit: []
  reset: []
  'view-selection': []
}>()
</script>

<template>
  <div v-if="state === 'selected'" class="drp-action-bar">
    <button type="button" class="drp-action-btn drp-action-btn--primary" @click="emit('commit')">
      {{ messages.commit }}
    </button>
    <button type="button" class="drp-action-btn drp-action-btn--secondary" @click="emit('reset')">
      {{ messages.reset }}
    </button>
    <button
      v-if="showViewSelection"
      type="button"
      class="drp-action-btn drp-action-btn--tertiary"
      @click="emit('view-selection')"
    >
      {{ messages.viewSelection }}
    </button>
  </div>
</template>

<style scoped>
.drp-action-bar {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  justify-content: center;
}

.drp-action-btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--drp-border, var(--border, #e5e4e7));
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.drp-action-btn--primary {
  background: var(--drp-accent, var(--accent, #aa3bff));
  color: #fff;
  border-color: var(--drp-accent, var(--accent, #aa3bff));
}

.drp-action-btn--primary:hover {
  opacity: 0.9;
}

.drp-action-btn--secondary {
  background: transparent;
  color: var(--drp-text, var(--text-h, #08060d));
}

.drp-action-btn--secondary:hover {
  background: var(--drp-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
}

.drp-action-btn--tertiary {
  background: transparent;
  color: var(--drp-accent, var(--accent, #aa3bff));
  border-color: transparent;
}

.drp-action-btn--tertiary:hover {
  background: var(--drp-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
}
</style>
