<script lang="ts" setup>
import type { ButtonProps } from './types'

const { size } = defineProps<ButtonProps>()
</script>

<template>
  <button>
    {{ size }}
    <slot />
  </button>
</template>
