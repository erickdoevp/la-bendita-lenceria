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
  <UiPanel>
    <div class="grid gap-5">
      <MovementsFilters
        id="movements"
        v-model:type="store.list.filters.type"
        v-model:date-from="store.list.filters.dateFrom"
        v-model:date-to="store.list.filters.dateTo"
        @clear="clearFilters"
      />

      <p
        v-if="filters.orderId"
        class="flex flex-wrap items-center gap-2 text-sm text-ink-muted"
      >
        Movimientos de la orden
        <span class="inline-flex items-center gap-1 rounded-lg bg-accent/10 py-1 pl-2 pr-1 font-mono text-xs text-accent">
          {{ filters.orderId }}
          <button
            type="button"
            class="grid size-5 place-items-center rounded-md hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Quitar filtro de orden"
            @click="clearOrder"
          >
            <Icon
              name="ph:x"
              class="size-3"
              aria-hidden="true"
            />
          </button>
        </span>
      </p>

      <UiAlert v-if="store.list.error">
        {{ store.list.error }}
        <button
          type="button"
          class="ml-1 font-medium underline underline-offset-2"
          @click="store.list.load()"
        >
          Reintentar
        </button>
      </UiAlert>

      <MovementsTableSkeleton v-if="store.list.pending && !page" />

      <UiEmptyState
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

      <UiPagination
        v-if="page"
        :page="page.page"
        :total-pages="page.totalPages"
        :total-elements="page.totalElements"
        :disabled="store.list.pending"
        @change="store.list.load"
      />
    </div>
  </UiPanel>
</template>
