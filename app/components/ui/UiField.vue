<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  srOnlyLabel?: boolean
}>()

const hintId = computed(() => `${props.id}-hint`)
const errorId = computed(() => `${props.id}-error`)
const describedBy = computed(() => [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="grid content-start gap-2">
    <label
      :for="id"
      class="flex items-baseline justify-between gap-2 text-sm font-medium text-ink"
      :class="{ 'sr-only': srOnlyLabel }"
    >
      {{ label }}
      <span
        v-if="optional"
        class="text-xs font-normal text-ink-muted"
      >Opcional</span>
    </label>

    <slot
      :id="id"
      :described-by="describedBy"
      :invalid="Boolean(error)"
    />

    <p
      v-if="hint && !error"
      :id="hintId"
      class="text-[13px] leading-snug text-ink-muted"
    >
      {{ hint }}
    </p>
    <p
      v-if="error"
      :id="errorId"
      class="text-[13px] leading-snug text-danger"
    >
      {{ error }}
    </p>
  </div>
</template>
