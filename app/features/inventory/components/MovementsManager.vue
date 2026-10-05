<script setup lang="ts">
import { INVENTORY_ROUTES, emptyMovementFilters } from '../constants'
import { useMovementsStore } from '../stores/movements.store'
import MovementsFilters from './MovementsFilters.vue'
import MovementsTable from './MovementsTable.vue'
import MovementsTableSkeleton from './MovementsTableSkeleton.vue'

const store = useMovementsStore()
const route = useRoute()

const page = computed(() => store.list.data)
const filters = computed(() => store.list.filters)
const filtered = computed(() => Boolean(filters.value.type || filters.value.dateFrom || filters.value.dateTo || filters.value.orderId))

watch(
  () => [filters.value.type, filters.value.dateFrom, filters.value.dateTo, filters.value.orderId],
  () => store.list.load(0),
)

// El filtro por orden viene de la URL (?orderId=): asi se puede enlazar desde cualquier movimiento
watch(() => route.query.orderId, (value) => {
  const orderId = typeof value === 'string' ? value : ''
  if (orderId !== store.list.filters.orderId) store.list.filters.orderId = orderId
  else store.list.load()
}, { immediate: true })

function clearOrder() {
  navigateTo({ path: INVENTORY_ROUTES.movements, query: {} }, { replace: true })
}

function clearFilters() {
  Object.assign(store.list.filters, emptyMovementFilters(), { orderId: store.list.filters.orderId })
}
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <MovementsFilters
        v-model:type="store.list.filters.type"
        v-model:date-from="store.list.filters.dateFrom"
        v-model:date-to="store.list.filters.dateTo"
        @clear="clearFilters"
      />

      <p
        v-if="filters.orderId"
        class="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        Movimientos de la orden
        <UBadge
          :label="filters.orderId"
          class="font-mono"
        >
          <template #trailing>
            <UButton
              variant="link"
              size="xs"
              icon="ph:x"
              class="p-0"
              aria-label="Quitar filtro de orden"
              @click="clearOrder"
            />
          </template>
        </UBadge>
      </p>

      <UAlert
        v-if="store.list.error"
        color="error"
        icon="ph:warning-circle"
        :title="store.list.error"
        :actions="retryAction(() => store.list.load())"
        orientation="horizontal"
      />

      <MovementsTableSkeleton v-if="store.list.pending && !page" />

      <UEmpty
        v-else-if="page && !page.items.length"
        icon="ph:arrows-down-up"
        :title="filtered ? 'Sin resultados' : 'Aún no hay movimientos'"
        :description="filtered ? 'Ningún movimiento coincide con estos filtros.' : 'Las entradas, ventas pagadas, devoluciones y ajustes aparecerán aquí.'"
      />

      <MovementsTable
        v-else-if="page"
        :items="page.items"
        :pending="store.list.pending"
        show-variant
      />

      <PagePagination
        v-if="page"
        :page="page"
        :disabled="store.list.pending"
        @change="store.list.load"
      />
    </div>
  </UCard>
</template>
