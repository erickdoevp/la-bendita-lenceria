<script setup lang="ts">
import { SHIPMENT_STATUS_LABELS } from '../constants'
import type { Shipment } from '../types'

defineProps<{
  shipment: Shipment | null
  error?: string | null
}>()

const statusClasses: Record<Shipment['status'], string> = {
  PENDING: 'bg-surface text-ink',
  IN_TRANSIT: 'bg-accent/10 text-accent',
  OUT_FOR_DELIVERY: 'bg-accent/10 text-accent',
  DELIVERED: 'bg-success-soft text-success',
  FAILED: 'bg-danger-soft text-danger',
  RETURNED: 'bg-warning-soft text-warning',
}
</script>

<template>
  <UiPanel title="Envío">
    <UiAlert v-if="error">
      {{ error }}
    </UiAlert>

    <p
      v-else-if="!shipment"
      class="text-sm text-ink-muted"
    >
      Aún no se registra el envío.
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
            :class="statusClasses[shipment.status]"
          >{{ SHIPMENT_STATUS_LABELS[shipment.status] }}</span>
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Paquetería
        </dt>
        <dd class="text-ink">
          {{ shipment.carrier }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Guía
        </dt>
        <dd class="min-w-0">
          <a
            v-if="shipment.trackingUrl"
            :href="shipment.trackingUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 truncate font-mono text-accent hover:underline"
          >
            {{ shipment.trackingNumber }}
            <Icon
              name="ph:arrow-square-out"
              class="size-3.5 shrink-0"
              aria-label="(abre en otra pestaña)"
            />
          </a>
          <span
            v-else
            class="font-mono text-ink"
          >{{ shipment.trackingNumber }}</span>
        </dd>
      </div>
      <div
        v-if="shipment.shippedAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Enviado
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatDateTime(shipment.shippedAt) }}
        </dd>
      </div>
      <div
        v-if="shipment.estimatedDeliveryAt && !shipment.deliveredAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Entrega estimada
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatDate(shipment.estimatedDeliveryAt) }}
        </dd>
      </div>
      <div
        v-if="shipment.deliveredAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Entregado
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatDateTime(shipment.deliveredAt) }}
        </dd>
      </div>
      <p
        v-if="shipment.notes"
        class="rounded-xl bg-surface px-3 py-2 text-[13px] text-ink-muted"
      >
        {{ shipment.notes }}
      </p>
      <p
        v-if="shipment.status === 'FAILED' || shipment.status === 'RETURNED'"
        class="text-[13px] leading-snug text-ink-muted"
      >
        El paquete no se entregó. Decide si reenvías o reembolsas la orden.
      </p>
    </dl>
  </UiPanel>
</template>
