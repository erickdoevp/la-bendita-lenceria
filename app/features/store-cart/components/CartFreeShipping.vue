<script setup lang="ts">
defineProps<{
  remaining: number
  /** 0 a 1. */
  progress: number
}>()
</script>

<template>
  <div class="grid gap-2.5">
    <p
      class="flex items-center gap-2 text-[13px] text-ink"
      aria-live="polite"
    >
      <Icon
        :name="remaining > 0 ? 'ph:truck-bold' : 'ph:check-circle-fill'"
        class="size-4 shrink-0"
        :class="remaining > 0 ? 'text-ink-muted' : 'text-success'"
        aria-hidden="true"
      />
      <span v-if="remaining > 0">
        Te faltan <strong class="font-semibold tabular-nums">{{ formatMoney(remaining) }}</strong> para el envío gratis.
      </span>
      <span v-else>Tu envío es gratis.</span>
    </p>
    <!-- Se anima con scaleX para no recalcular el layout -->
    <div
      class="h-1 overflow-hidden rounded-full bg-line/60"
      aria-hidden="true"
    >
      <div
        class="h-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="remaining > 0 ? 'bg-accent' : 'bg-success'"
        :style="{ transform: `scaleX(${progress})` }"
      />
    </div>
  </div>
</template>
