<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'
import { SHIPMENT_STATUS_LABELS } from '../constants'
import type { Shipment } from '../types'

defineProps<{
  shipment: Shipment | null
  error?: string | null
}>()

const statusColors: Record<Shipment['status'], BadgeProps['color']> = {
  PENDING: 'neutral',
  IN_TRANSIT: 'primary',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  FAILED: 'error',
  RETURNED: 'warning',
}
</script>

<template>
  <UCard
    title="Envío"
  >
    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error"
    />

    <p
      v-else-if="!shipment"
      class="text-sm text-muted"
    >
      Aún no se registra el envío.
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
            :color="statusColors[shipment.status]"
            :label="SHIPMENT_STATUS_LABELS[shipment.status]"
          />
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted">
          Paquetería
        </dt>
        <dd class="text-highlighted">
          {{ shipment.carrier }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted">
          Guía
        </dt>
        <dd class="min-w-0">
          <a
            v-if="shipment.trackingUrl"
            :href="shipment.trackingUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 truncate font-mono text-primary hover:underline"
          >
            {{ shipment.trackingNumber }}
            <UIcon
              name="ph:arrow-square-out"
              class="size-3.5 shrink-0"
              aria-label="(abre en otra pestaña)"
            />
          </a>
          <span
            v-else
            class="font-mono text-highlighted"
          >{{ shipment.trackingNumber }}</span>
        </dd>
      </div>
      <div
        v-if="shipment.shippedAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Enviado
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatDateTime(shipment.shippedAt) }}
        </dd>
      </div>
      <div
        v-if="shipment.estimatedDeliveryAt && !shipment.deliveredAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Entrega estimada
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatDate(shipment.estimatedDeliveryAt) }}
        </dd>
      </div>
      <div
        v-if="shipment.deliveredAt"
        class="flex justify-between gap-4"
      >
        <dt class="text-muted">
          Entregado
        </dt>
        <dd class="tabular-nums text-highlighted">
          {{ formatDateTime(shipment.deliveredAt) }}
        </dd>
      </div>
      <p
        v-if="shipment.notes"
        class="rounded-lg bg-muted px-3 py-2 text-sm text-muted"
      >
        {{ shipment.notes }}
      </p>
      <p
        v-if="shipment.status === 'FAILED' || shipment.status === 'RETURNED'"
        class="text-sm leading-snug text-muted"
      >
        El paquete no se entregó. Decide si reenvías o reembolsas la orden.
      </p>
    </dl>
  </UCard>
</template>
