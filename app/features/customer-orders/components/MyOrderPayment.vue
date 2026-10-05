<script setup lang="ts">
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CLASSES, PAYMENT_STATUS_LABELS } from '~/features/orders'
import type { Payment } from '~/features/orders'

defineProps<{ payment: Payment | null }>()
</script>

<template>
  <UiPanel title="Pago">
    <p
      v-if="!payment"
      class="text-sm text-ink-muted"
    >
      Aún no has iniciado el pago de este pedido.
    </p>
    <dl
      v-else
      class="grid gap-3 text-sm"
    >
      <div class="flex items-center justify-between gap-3">
        <dt class="text-ink-muted">
          Estado
        </dt>
        <dd>
          <span
            class="inline-flex rounded-lg px-2 py-1 text-xs font-medium"
            :class="PAYMENT_STATUS_CLASSES[payment.status] ?? 'bg-surface text-ink'"
          >{{ PAYMENT_STATUS_LABELS[payment.status] ?? payment.status }}</span>
        </dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-ink-muted">
          Método
        </dt>
        <dd class="text-ink">
          {{ PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
        </dd>
      </div>
      <div
        v-if="payment.paidAt"
        class="flex justify-between gap-3"
      >
        <dt class="text-ink-muted">
          Pagado el
        </dt>
        <dd class="text-ink">
          {{ formatDateTime(payment.paidAt) }}
        </dd>
      </div>
      <div
        v-if="payment.refundedAmount > 0"
        class="flex justify-between gap-3"
      >
        <dt class="text-ink-muted">
          Reembolsado
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatMoney(payment.refundedAmount) }}
        </dd>
      </div>
      <p
        v-if="payment.status === 'FAILED' && payment.failureMessage"
        class="rounded-xl bg-danger-soft px-3.5 py-2.5 text-danger"
      >
        {{ payment.failureMessage }}
      </p>
    </dl>
  </UiPanel>
</template>
