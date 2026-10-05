<script setup lang="ts">
import { addressLines } from '~/features/orders'
import type { Order } from '~/features/orders'

const props = defineProps<{ order: Order }>()

const showPickupCode = computed(() => props.order.pickup && props.order.status === 'READY_FOR_PICKUP' && props.order.pickupCode)
</script>

<template>
  <UiPanel :title="order.pickup ? 'Recoger en tienda' : 'Envío a domicilio'">
    <div class="grid gap-4 text-sm">
      <!-- Codigo de recogida: se muestra en grande para enseñarlo en mostrador -->
      <div
        v-if="showPickupCode"
        class="grid justify-items-center gap-1 rounded-xl bg-accent/8 px-4 py-5 text-center"
      >
        <span class="text-[13px] text-ink-muted">Tu código de recogida</span>
        <span class="font-mono text-4xl font-semibold tracking-[0.2em] text-ink">{{ order.pickupCode }}</span>
        <span class="text-[13px] text-ink-muted">Muéstralo al recoger tu pedido.</span>
      </div>

      <template v-if="order.pickup">
        <p class="font-medium text-ink">
          {{ order.pickupLocationName ?? 'Sucursal' }}
        </p>
        <p
          v-if="!showPickupCode && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED'"
          class="text-ink-muted"
        >
          Te avisaremos cuando esté listo para recoger.
        </p>
      </template>

      <address
        v-else-if="order.shippingAddress"
        class="grid gap-0.5 not-italic leading-relaxed text-ink-muted"
      >
        <span class="font-medium text-ink">{{ order.shippingAddress.recipientName }}</span>
        <span
          v-for="line in addressLines(order.shippingAddress)"
          :key="line"
        >{{ line }}</span>
        <span class="mt-1">Tel. {{ order.shippingAddress.phone }}</span>
      </address>

      <p
        v-if="order.notes"
        class="rounded-xl bg-surface px-3.5 py-2.5 text-ink-muted"
      >
        <span class="font-medium text-ink">Tu nota:</span> {{ order.notes }}
      </p>
    </div>
  </UiPanel>
</template>
