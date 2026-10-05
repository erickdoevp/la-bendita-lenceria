<script setup lang="ts">
import { INVENTORY_ROUTES } from '../constants'
import { useInventoryApi } from '../services'
import type { StockMovement } from '../types'
import MovementsTable from './MovementsTable.vue'
import MovementsTableSkeleton from './MovementsTableSkeleton.vue'

/** Movimientos de stock que genero una orden (venta pagada, devolucion). */
const props = defineProps<{ orderId: string }>()

const api = useInventoryApi()
const items = ref<StockMovement[] | null>(null)
const pending = ref(false)
const error = ref<string | null>(null)

async function load() {
  pending.value = true
  error.value = null
  try {
    // Una orden genera pocos movimientos: una pagina basta
    items.value = (await api.movements({ orderId: props.orderId, size: 100 })).items
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    pending.value = false
  }
}

onMounted(load)
defineExpose({ load })
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <h2 class="font-semibold tracking-tight text-highlighted">
            Inventario
          </h2>
          <p class="max-w-[65ch] text-sm leading-relaxed text-muted">
            Movimientos de stock de esta orden. Un pedido sin pagar solo aparta stock y no aparece aquí.
          </p>
        </div>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="ph:arrows-down-up"
            :to="{ path: INVENTORY_ROUTES.movements, query: { orderId } }"
            label="Ver en kardex"
          />
      </div>
    </template>

    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error"
      :actions="retryAction(load)"
      orientation="horizontal"
    />

    <MovementsTableSkeleton
      v-else-if="pending && !items"
      :rows="2"
    />

    <p
      v-else-if="items && !items.length"
      class="text-sm text-muted"
    >
      Sin movimientos de stock.
    </p>

    <MovementsTable
      v-else-if="items"
      :items="items"
      :pending="pending"
      show-variant
      hide-order
    />
  </UCard>
</template>
