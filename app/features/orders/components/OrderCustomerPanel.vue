<script setup lang="ts">
import { ORDER_ROUTES } from '../constants'
import type { Order } from '../types'
import { addressLines, customerName, isGuest } from '../utils/customer'

defineProps<{ order: Order }>()
</script>

<template>
  <UiPanel title="Cliente y entrega">
    <div class="grid gap-5 text-sm">
      <div class="grid gap-1.5">
        <p class="flex flex-wrap items-center gap-2">
          <span class="font-medium text-ink">{{ customerName(order) }}</span>
          <span
            v-if="isGuest(order)"
            class="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-muted"
          >Invitado</span>
        </p>
        <template v-if="isGuest(order)">
          <a
            v-if="order.guestEmail"
            :href="`mailto:${order.guestEmail}`"
            class="justify-self-start text-ink-muted hover:text-ink hover:underline"
          >{{ order.guestEmail }}</a>
          <a
            v-if="order.guestPhone"
            :href="`tel:${order.guestPhone}`"
            class="justify-self-start tabular-nums text-ink-muted hover:text-ink hover:underline"
          >{{ order.guestPhone }}</a>
        </template>
        <NuxtLink
          v-else-if="order.userId"
          :to="{ path: ORDER_ROUTES.list, query: { userId: order.userId } }"
          class="inline-flex items-center gap-1 justify-self-start text-accent hover:underline"
        >
          <Icon
            name="ph:list-bullets"
            class="size-4"
            aria-hidden="true"
          />
          Ver pedidos de este cliente
        </NuxtLink>
      </div>

      <div class="grid gap-2 border-t border-line pt-5">
        <p class="flex items-center gap-2 font-medium text-ink">
          <Icon
            :name="order.pickup ? 'ph:storefront' : 'ph:truck'"
            class="size-4 text-ink-muted"
            aria-hidden="true"
          />
          {{ order.pickup ? 'Recoger en tienda' : 'Envío a domicilio' }}
        </p>

        <template v-if="order.pickup">
          <p class="text-ink-muted">
            {{ order.pickupLocationName ?? 'Sucursal sin nombre' }}
          </p>
          <div
            v-if="order.pickupCode"
            class="grid justify-items-start gap-1 rounded-xl bg-surface px-4 py-3"
          >
            <span class="text-xs text-ink-muted">Código de recogida</span>
            <span class="font-mono text-xl font-semibold tracking-[0.2em] text-ink">{{ order.pickupCode }}</span>
            <span class="text-xs text-ink-muted">Compáralo con el que presente la clienta antes de entregar.</span>
          </div>
        </template>

        <address
          v-else-if="order.shippingAddress"
          class="grid gap-0.5 not-italic text-ink-muted"
        >
          <span class="text-ink">{{ order.shippingAddress.recipientName }}</span>
          <span
            v-for="line in addressLines(order.shippingAddress)"
            :key="line"
          >{{ line }}</span>
          <a
            :href="`tel:${order.shippingAddress.phone}`"
            class="justify-self-start tabular-nums hover:text-ink hover:underline"
          >Tel. {{ order.shippingAddress.phone }}</a>
        </address>
      </div>
    </div>
  </UiPanel>
</template>
