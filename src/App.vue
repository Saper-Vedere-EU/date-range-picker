<script setup lang="ts">
import { ref } from "vue";
import { DateRangePicker } from "./components/organisms/DateRangePicker";

const start = ref<Date | undefined>();
const end = ref<Date | undefined>();
</script>

<template>
  <div id="demo">
    <h2>DateRangePicker Demo</h2>
    <DateRangePicker v-model:start="start" v-model:end="end" />
    <div class="debug">
      <p>
        <strong>Start:</strong>
        {{ start ? start.toLocaleDateString("fr-FR") : "—" }}
      </p>
      <p>
        <strong>End:</strong>
        {{ end ? end.toLocaleDateString("fr-FR") : "—" }}
      </p>
    </div>
  </div>
</template>

<style scoped>
#demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px 24px;
}

.debug {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--text);
}
</style>
