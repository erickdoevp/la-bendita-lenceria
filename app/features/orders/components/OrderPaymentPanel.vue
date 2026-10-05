<script setup lang="ts">
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CLASSES, PAYMENT_STATUS_LABELS } from '../constants'
import type { Payment } from '../types'

defineProps<{
  payment: Payment | null
  error?: string | null
}>()
</script>

<template>
  <UiPanel title="Pago">
    <UiAlert v-if="error">
      {{ error }}
    </UiAlert>

    <p
      v-else-if="!payment"
      class="text-sm text-ink-muted"
    >
      La clienta todavía no inicia el pago.
    </p>

    <dl
      v-else
      class="grid gap-2.5 text-sm"
    >
      <div class="flex items-center justify-between gap-4">
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
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Método
        </dt>
        <dd class="text-ink">
          {{ PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Monto
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatMoney(payment.amount) }}
        </dd>
      </div>
      <div
        v-if="payment.refundedAmount > 0"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Reembolsado
        </dt>
        <dd class="tabular-nums text-danger">
          −{{ formatMoney(payment.refundedAmount) }}
        </dd>
      </div>
      <div
        v-if="payment.paidAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Pagado
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatDateTime(payment.paidAt) }}
        </dd>
      </div>
      <div
        v-if="payment.attemptCount > 1"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Intentos
        </dt>
        <dd class="tabular-nums text-ink">
          {{ payment.attemptCount }}
        </dd>
      </div>
      <div
        v-if="payment.stripePaymentIntentId"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Stripe
        </dt>
        <dd class="truncate font-mono text-xs text-ink-muted">
          {{ payment.stripePaymentIntentId }}
        </dd>
      </div>
      <p
        v-if="payment.failureMessage"
        class="rounded-xl bg-danger-soft px-3 py-2 text-[13px] text-danger"
      >
        {{ payment.failureMessage }}
      </p>
      <p
        v-if="payment.status === 'PENDING' && payment.method !== 'CARD'"
        class="text-[13px] leading-snug text-ink-muted"
      >
        Confirma el pago cuando veas la transferencia en el banco o recibas el efectivo.
      </p>
    </dl>
  </UiPanel>
</template>
