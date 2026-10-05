<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { INVENTORY_ROUTES, SYSTEM_USER } from '../constants'
import type { StockMovement } from '../types'
import MovementTypeBadge from './MovementTypeBadge.vue'

const props = defineProps<{
  items: StockMovement[]
  /** En el kardex general se muestra a que articulo pertenece cada movimiento. */
  showVariant?: boolean
  /** Dentro del detalle de una orden el enlace a la orden sobra. */
  hideOrder?: boolean
  pending?: boolean
}>()

// La columna del articulo solo aparece en el kardex general
const columns = computed<TableColumn<StockMovement>[]>(() => [
  { accessorKey: 'createdAt', header: 'Fecha' },
  ...(props.showVariant ? [{ accessorKey: 'productName', header: 'Artículo' } as TableColumn<StockMovement>] : []),
  { accessorKey: 'type', header: 'Tipo' },
  { accessorKey: 'quantity', header: 'Cantidad', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'stockAfter', header: 'Stock', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'reason', header: 'Detalle', meta: { class: { td: 'whitespace-normal' } } },
])

function signed(quantity: number) {
  return quantity > 0 ? `+${quantity}` : String(quantity)
}

function quantityClass(quantity: number) {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-error'
  return 'text-muted'
}
</script>

<template>
  <UTable
    :data="items"
    :columns="columns"
    :class="['-mx-4 sm:-mx-6 transition-opacity', pending && 'opacity-60']"
    :aria-busy="pending || undefined"
  >
    <template #createdAt-cell="{ row }">
      <span class="tabular-nums">{{ formatDateTime(row.original.createdAt) }}</span>
    </template>

    <template #productName-cell="{ row }">
      <NuxtLink
        :to="INVENTORY_ROUTES.variant(row.original.variantId)"
        class="grid min-w-40"
      >
        <span class="truncate font-medium text-highlighted hover:underline">{{ row.original.productName }}</span>
        <span class="truncate font-mono text-xs">{{ row.original.variantSku }}</span>
      </NuxtLink>
    </template>

    <template #type-cell="{ row }">
      <MovementTypeBadge :type="row.original.type" />
    </template>

    <template #quantity-cell="{ row }">
      <span
        class="font-semibold tabular-nums"
        :class="quantityClass(row.original.quantity)"
      >{{ signed(row.original.quantity) }}</span>
    </template>

    <template #stockAfter-cell="{ row }">
      <span class="tabular-nums">
        {{ row.original.stockBefore }}
        <UIcon
          name="ph:arrow-right"
          class="mx-0.5 size-3 align-[-1px]"
          aria-label="a"
        />
        <span class="font-medium text-highlighted">{{ row.original.stockAfter }}</span>
      </span>
    </template>

    <template #reason-cell="{ row }">
      <div class="grid min-w-52 gap-0.5">
        <span
          class="text-highlighted"
          :class="!row.original.reason && 'italic text-muted'"
        >{{ row.original.reason ?? 'Sin motivo' }}</span>
        <span class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span class="inline-flex items-center gap-1">
            <UIcon
              :name="row.original.createdBy === SYSTEM_USER ? 'ph:robot' : 'ph:user'"
              class="size-3.5"
            />
            {{ row.original.createdBy === SYSTEM_USER ? 'Automático' : row.original.createdBy }}
          </span>
          <NuxtLink
            v-if="row.original.orderId && !hideOrder"
            :to="INVENTORY_ROUTES.order(row.original.orderId)"
            class="inline-flex items-center gap-1 font-mono text-primary hover:underline"
            :title="`Ver la orden ${row.original.orderId}`"
          >
            <UIcon
              name="ph:receipt"
              class="size-3.5"
            />
            #{{ row.original.orderId.slice(0, 8) }}
          </NuxtLink>
        </span>
      </div>
    </template>
  </UTable>
</template>
