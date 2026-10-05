<script setup lang="ts">
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '../constants'
import type { Payment } from '../types'

defineProps<{
  payment: Payment | null
  error?: string | null
}>()
</script>

<template>
  <UCard
    title="Pago"
  >
    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error"
    />

    <p
      v-else-if="!payment"
      class="text-sm text-muted"
    >
      La clienta todavía no inicia el pago.
    </p>

    <dl
      v-else
      class="grid gap-2.5 text-sm"
    >
      <div class="flex items-center justify-between gap-4">
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
      <div class="flex justify-between gap-4">
        <dt class="text-muted">
          Método
        </dt>
        <dd class="text-highlighted">
          {{ PAYMENT_METHOD_LABELS[payment.method] ?? payment.method }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted">
          Monto
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatMoney(payment.amount) }}
        </dd>
      </div>
      <div
        v-if="payment.refundedAmount > 0"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Reembolsado
        </dt>
        <dd class="tabular-nums text-error">
          −{{ formatMoney(payment.refundedAmount) }}
        </dd>
      </div>
      <div
        v-if="payment.paidAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Pagado
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatDateTime(payment.paidAt) }}
        </dd>
      </div>
      <div
        v-if="payment.attemptCount > 1"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Intentos
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ payment.attemptCount }}
        </dd>
      </div>
      <div
        v-if="payment.stripePaymentIntentId"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Stripe
        </dt>
        <dd class="truncate font-mono text-xs text-muted">
          {{ payment.stripePaymentIntentId }}
        </dd>
      </div>
      <p
        v-if="payment.failureMessage"
        class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
      >
        {{ payment.failureMessage }}
      </p>
      <p
        v-if="payment.status === 'PENDING' && payment.method !== 'CARD'"
        class="text-sm leading-snug text-muted"
      >
        Confirma el pago cuando veas la transferencia en el banco o recibas el efectivo.
      </p>
    </dl>
  </UCard>
</template>
