<script setup lang="ts">
import { INVENTORY_ROUTES, SYSTEM_USER } from '../constants'
import type { StockMovement } from '../types'
import MovementTypeBadge from './MovementTypeBadge.vue'

defineProps<{
  items: StockMovement[]
  /** En el kardex general se muestra a que articulo pertenece cada movimiento. */
  showVariant?: boolean
  /** Dentro del detalle de una orden el enlace a la orden sobra. */
  hideOrder?: boolean
  pending?: boolean
}>()

function signed(quantity: number) {
  return quantity > 0 ? `+${quantity}` : String(quantity)
}

function quantityClass(quantity: number) {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-danger'
  return 'text-ink-muted'
}
</script>

<template>
  <div class="-mx-5 overflow-x-auto sm:-mx-6">
    <table class="w-full text-left text-sm">
      <thead class="text-ink-muted">
        <tr>
          <th class="px-5 pb-3 font-medium sm:px-6">
            Fecha
          </th>
          <th
            v-if="showVariant"
            class="pb-3 pr-4 font-medium"
          >
            Artículo
          </th>
          <th class="pb-3 pr-4 font-medium">
            Tipo
          </th>
          <th class="pb-3 pr-4 text-right font-medium">
            Cantidad
          </th>
          <th class="pb-3 pr-4 text-right font-medium">
            Stock
          </th>
          <th class="px-5 pb-3 font-medium sm:pl-0 sm:pr-6">
            Detalle
          </th>
        </tr>
      </thead>
      <tbody
        class="divide-y divide-line border-t border-line transition-opacity"
        :class="pending && 'opacity-60'"
        :aria-busy="pending || undefined"
      >
        <tr
          v-for="movement in items"
          :key="movement.id"
        >
          <td class="whitespace-nowrap px-5 py-3 tabular-nums text-ink-muted sm:px-6">
            {{ formatDateTime(movement.createdAt) }}
          </td>
          <td
            v-if="showVariant"
            class="py-3 pr-4"
          >
            <NuxtLink
              :to="INVENTORY_ROUTES.variant(movement.variantId)"
              class="grid min-w-40 rounded-md focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span class="truncate font-medium text-ink hover:underline">{{ movement.productName }}</span>
              <span class="truncate font-mono text-xs text-ink-muted">{{ movement.variantSku }}</span>
            </NuxtLink>
          </td>
          <td class="py-3 pr-4">
            <MovementTypeBadge :type="movement.type" />
          </td>
          <td
            class="whitespace-nowrap py-3 pr-4 text-right font-semibold tabular-nums"
            :class="quantityClass(movement.quantity)"
          >
            {{ signed(movement.quantity) }}
          </td>
          <td class="whitespace-nowrap py-3 pr-4 text-right tabular-nums text-ink-muted">
            {{ movement.stockBefore }}
            <Icon
              name="ph:arrow-right"
              class="mx-0.5 size-3 align-[-1px]"
              aria-label="a"
            />
            <span class="font-medium text-ink">{{ movement.stockAfter }}</span>
          </td>
          <td class="px-5 py-3 sm:pl-0 sm:pr-6">
            <div class="grid min-w-52 gap-0.5">
              <span
                class="text-ink"
                :class="!movement.reason && 'italic text-ink-muted'"
              >{{ movement.reason ?? 'Sin motivo' }}</span>
              <span class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                <span class="inline-flex items-center gap-1">
                  <Icon
                    :name="movement.createdBy === SYSTEM_USER ? 'ph:robot' : 'ph:user'"
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  {{ movement.createdBy === SYSTEM_USER ? 'Automático' : movement.createdBy }}
                </span>
                <NuxtLink
                  v-if="movement.orderId && !hideOrder"
                  :to="INVENTORY_ROUTES.order(movement.orderId)"
                  class="inline-flex items-center gap-1 font-mono text-accent hover:underline"
                  :title="`Ver la orden ${movement.orderId}`"
                >
                  <Icon
                    name="ph:receipt"
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  #{{ movement.orderId.slice(0, 8) }}
                </NuxtLink>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
