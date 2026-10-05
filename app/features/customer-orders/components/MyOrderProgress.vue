<script setup lang="ts">
import type { Order } from '~/features/orders'

const props = defineProps<{ order: Order }>()

const steps = computed(() => [
  { key: 'CONFIRMED', label: 'Pagado' },
  { key: 'PROCESSING', label: 'En preparación' },
  props.order.pickup
    ? { key: 'READY_FOR_PICKUP', label: 'Listo para recoger' }
    : { key: 'SHIPPED', label: 'Enviado' },
  { key: 'DELIVERED', label: 'Entregado' },
])

const current = computed(() => steps.value.findIndex(step => step.key === props.order.status))
</script>

<template>
  <ol class="grid grid-cols-4 gap-2">
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="grid gap-2"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span
        class="h-1.5 rounded-full transition-colors duration-300"
        :class="index <= current ? 'bg-primary' : 'bg-accented'"
      />
      <span
        class="text-xs leading-tight sm:text-sm"
        :class="index === current ? 'font-medium text-highlighted' : index < current ? 'text-highlighted' : 'text-muted'"
      >
        {{ step.label }}
      </span>
    </li>
  </ol>
</template>
