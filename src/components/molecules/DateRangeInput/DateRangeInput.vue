<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { applyMask, countRangeDigits, formatRange, parseRange } from './mask-utils'
import type { DateRangeInputProps, DateRangeInputSlotBindings } from './types'

const props = withDefaults(defineProps<DateRangeInputProps>(), {
  format: 'dd/MM/yyyy',
  separator: ' - ',
  placeholder: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:start': [value: Date | undefined]
  'update:end': [value: Date | undefined]
  focus: []
  /** User pressed Enter with a complete, valid range. */
  submit: []
}>()

defineSlots<{
  default(bindings: DateRangeInputSlotBindings): unknown
}>()

const text = ref('')

const maxDigits = computed(() => countRangeDigits(props.format, props.separator))
const maxLength = computed(() => `${props.format}${props.separator}${props.format}`.length)
const resolvedPlaceholder = computed(
  () => props.placeholder ?? `${props.format}${props.separator}${props.format}`,
)

watch(
  () => [props.start, props.end],
  () => {
    const formatted = formatRange(props.start, props.end, props.format, props.separator)
    if (formatted !== text.value) text.value = formatted
  },
  { immediate: true },
)

function emitParsed() {
  const { start, end } = parseRange(text.value, props.format, props.separator)
  if (start && end && start.getTime() <= end.getTime()) {
    if (start.getTime() !== props.start?.getTime()) emit('update:start', start)
    if (end.getTime() !== props.end?.getTime()) emit('update:end', end)
    return true
  }
  return false
}

function setValue(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, maxDigits.value)
  text.value = applyMask(digits, props.format, props.separator)
  emitParsed()
}

function handleBlur() {
  if (text.value === '') {
    if (props.start !== undefined) emit('update:start', undefined)
    if (props.end !== undefined) emit('update:end', undefined)
    return
  }
  if (!emitParsed()) {
    text.value = formatRange(props.start, props.end, props.format, props.separator)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (emitParsed()) emit('submit')
  }
}

function handleFocus() {
  emit('focus')
}

const bindings = computed<DateRangeInputSlotBindings>(() => ({
  value: text.value,
  onValueChange: setValue,
  onFocus: handleFocus,
  onBlur: handleBlur,
  onKeydown: handleKeydown,
  attrs: {
    placeholder: resolvedPlaceholder.value,
    maxlength: maxLength.value,
    'aria-label': props.ariaLabel,
  },
}))

function onNativeInput(e: Event) {
  setValue((e.target as HTMLInputElement).value)
}
</script>

<template>
  <slot v-bind="bindings">
    <input
      class="drp-input"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      spellcheck="false"
      :value="bindings.value"
      :placeholder="bindings.attrs.placeholder"
      :aria-label="bindings.attrs['aria-label']"
      :maxlength="bindings.attrs.maxlength"
      @input="onNativeInput"
      @focus="bindings.onFocus"
      @blur="bindings.onBlur"
      @keydown="bindings.onKeydown"
    />
  </slot>
</template>

<style scoped>
.drp-input {
  font: inherit;
  font-family: var(--drp-font);
  color: var(--drp-text);
  background: var(--drp-bg);
  border: 1px solid var(--drp-border);
  border-radius: 6px;
  padding: 8px 12px;
  outline: none;
  min-width: 240px;
  transition: border-color 0.15s;
}

.drp-input::placeholder {
  color: var(--drp-muted-text);
}

.drp-input:focus {
  border-color: var(--drp-accent);
}
</style>
