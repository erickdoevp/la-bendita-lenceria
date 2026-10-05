<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import type { CartSummary } from '../types'

defineProps<{
  summary: CartSummary
  busy: boolean
}>()

const emit = defineEmits<{ checkout: [] }>()
</script>

<template>
  <div class="grid gap-4">
    <dl class="grid gap-2 text-sm">
      <div
        v-if="summary.savings > 0"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Ahorras
        </dt>
        <dd class="font-medium tabular-nums text-success">
          −{{ formatMoney(summary.savings) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Envío
        </dt>
        <dd class="text-ink">
          {{ summary.remainingForFreeShipping > 0 ? 'Se calcula al pagar' : 'Gratis' }}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt class="font-medium text-ink">
          Subtotal
        </dt>
        <dd class="text-lg font-semibold tabular-nums text-ink">
          {{ formatMoney(summary.subtotal) }}
        </dd>
      </div>
    </dl>

    <!-- TODO: la pagina de pago aun no existe -->
    <UiButton
      :to="STORE_ROUTES.checkout"
      class="w-full"
      :class="busy && 'pointer-events-none opacity-60'"
      :aria-disabled="busy || undefined"
      @click="emit('checkout')"
    >
      Continuar al pago
      <Icon
        name="ph:arrow-right-bold"
        class="size-4"
        aria-hidden="true"
      />
    </UiButton>

    <p class="flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-muted">
      <Icon
        name="ph:lock-simple-bold"
        class="size-3.5"
        aria-hidden="true"
      />
      IVA incluido. Los cupones se aplican al pagar.
    </p>
  </div>
</template>
