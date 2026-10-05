<script setup lang="ts">
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '~/features/orders'
import type { Payment } from '~/features/orders'

defineProps<{ payment: Payment | null }>()
</script>

<template>
  <UCard
    title="Pago"
  >
    <p
      v-if="!payment"
      class="text-sm text-muted"
    >
      Aún no has iniciado el pago de este pedido.
    </p>
    <dl
      v-else
      class="grid gap-3 text-sm"
    >
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">
          Estado
        </dt>
        <dd>
          <UBadge
            :color="PAYMENT_STATUS_COLORS[payment.status] ?? 'neutral'"
            :label="PAYMENT_STATUS_LABELS[payment.status] ?? payment.status"
          />
        </dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">
          Método
        </dt>
        <dd class="text-highlighted">
          {{ PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
        </dd>
      </div>
      <div
        v-if="payment.paidAt"
        class="flex justify-between gap-3"
      >
        <dt class="text-muted">
          Pagado el
        </dt>
        <dd class="text-highlighted">
          {{ formatDateTime(payment.paidAt) }}
        </dd>
      </div>
      <div
        v-if="payment.refundedAmount > 0"
        class="flex justify-between gap-3"
      >
        <dt class="text-muted">
          Reembolsado
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatMoney(payment.refundedAmount) }}
        </dd>
      </div>
      <p
        v-if="payment.status === 'FAILED' && payment.failureMessage"
        class="rounded-lg bg-error/10 px-3.5 py-2.5 text-error"
      >
        {{ payment.failureMessage }}
      </p>
    </dl>
  </UCard>
</template>
