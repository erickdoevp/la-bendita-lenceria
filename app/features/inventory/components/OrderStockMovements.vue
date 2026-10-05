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
  <UiPanel
    title="Inventario"
    description="Movimientos de stock de esta orden. Un pedido sin pagar solo aparta stock y no aparece aquí."
  >
    <template #actions>
      <UiButton
        variant="ghost"
        size="sm"
        icon="ph:arrows-down-up"
        :to="{ path: INVENTORY_ROUTES.movements, query: { orderId } }"
      >
        Ver en kardex
      </UiButton>
    </template>

    <UiAlert v-if="error">
      {{ error }}
      <button
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="load"
      >
        Reintentar
      </button>
    </UiAlert>

    <MovementsTableSkeleton
      v-else-if="pending && !items"
      :rows="2"
    />

    <p
      v-else-if="items && !items.length"
      class="text-sm text-ink-muted"
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
  </UiPanel>
</template>
