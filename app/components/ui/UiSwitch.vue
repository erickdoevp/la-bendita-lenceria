<script setup lang="ts">
defineProps<{
  id: string
  label: string
  description?: string
}>()

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <label
      :for="id"
      class="grid gap-0.5"
    >
      <span class="text-sm font-medium text-ink">{{ label }}</span>
      <span
        v-if="description"
        class="text-[13px] text-ink-muted"
      >{{ description }}</span>
    </label>
    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="model"
      class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      :class="model ? 'bg-accent' : 'bg-line'"
      @click="model = !model"
    >
      <span
        class="inline-block size-5 rounded-full bg-surface-raised shadow-sm transition-transform duration-200"
        :class="model ? 'translate-x-[22px]' : 'translate-x-0.5'"
      />
    </button>
  </div>
</template>
