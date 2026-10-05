<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="grid justify-items-start gap-3 rounded-xl border border-dashed border-line px-5 py-6">
    <span class="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
      <Icon
        :name="icon"
        class="size-5"
        aria-hidden="true"
      />
    </span>
    <div class="grid gap-1">
      <p class="font-medium text-ink">
        {{ title }}
      </p>
      <p
        v-if="description"
        class="max-w-[52ch] text-sm leading-relaxed text-ink-muted"
      >
        {{ description }}
      </p>
    </div>
    <slot />
  </div>
</template>
