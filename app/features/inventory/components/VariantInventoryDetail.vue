<script setup lang="ts">
import { useVariantInventory } from '../composables/useVariantInventory'
import { INVENTORY_ROUTES, emptyMovementFilters } from '../constants'
import type { Inventory, StockAction } from '../types'
import MovementsFilters from './MovementsFilters.vue'
import MovementsTable from './MovementsTable.vue'
import MovementsTableSkeleton from './MovementsTableSkeleton.vue'
import StockAdjustForm from './StockAdjustForm.vue'
import StockCountForm from './StockCountForm.vue'
import VariantStockHeader from './VariantStockHeader.vue'

const props = defineProps<{ variantId: string }>()

const { variant, pending, error, movements, load, refreshLevels, onAdjusted } = useVariantInventory(props.variantId)

const action = ref<StockAction | null>(null)
const notice = ref<string | null>(null)

const modalOpen = computed({
  get: () => action.value !== null,
  set: (value) => {
    if (!value) action.value = null
  },
})

const modalCopy: Record<StockAction, { title: string, description: string }> = {
  entry: { title: 'Registrar entrada', description: 'Mercancía que llega al almacén (compra a proveedor, reposición).' },
  exit: { title: 'Registrar salida', description: 'Merma, daño o pérdida. Las ventas se descuentan solas al pagarse.' },
  count: { title: 'Conteo físico', description: 'Fija el stock con lo que contaste en almacén. La diferencia queda como ajuste.' },
}

const page = computed(() => movements.data)
const filters = computed(() => movements.filters)
const filtered = computed(() => Boolean(filters.value.type || filters.value.dateFrom || filters.value.dateTo))

onMounted(() => {
  load()
  movements.load(0)
})

watch(
  () => [filters.value.type, filters.value.dateFrom, filters.value.dateTo],
  () => movements.load(0),
)

function open(next: StockAction) {
  notice.value = null
  action.value = next
  // Lo reservado cambia con los pedidos: trae los numeros reales antes de ajustar
  void refreshLevels()
}

function onSaved(inventory: Inventory) {
  const done = action.value
  onAdjusted(inventory)
  action.value = null
  notice.value = done === 'entry'
    ? 'Entrada registrada.'
    : done === 'exit' ? 'Salida registrada.' : 'Conteo guardado.'
}

function clearFilters() {
  Object.assign(movements.filters, emptyMovementFilters())
}
</script>

<template>
  <div class="grid gap-8">
    <div class="grid gap-3">
      <NuxtLink
        :to="INVENTORY_ROUTES.stock"
        class="inline-flex items-center gap-1.5 justify-self-start rounded-md text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Icon
          name="ph:arrow-left"
          class="size-4"
          aria-hidden="true"
        />
        Existencias
      </NuxtLink>
      <UiPageHeader
        :title="variant?.productName ?? 'Inventario de variante'"
        description="Registra entradas, salidas y conteos. Cada cambio queda en el kardex."
      />
    </div>

    <UiAlert v-if="error">
      {{ error.status === 404 ? 'Esta variante no existe o no tiene inventario.' : error.message }}
      <button
        v-if="error.status !== 404"
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="load"
      >
        Reintentar
      </button>
    </UiAlert>

    <UiPanel v-else-if="pending && !variant">
      <div
        class="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]"
        role="status"
        aria-label="Cargando variante"
      >
        <UiSkeleton class="aspect-[4/5] w-28" />
        <div class="grid content-start gap-4">
          <UiSkeleton class="h-6 w-40" />
          <UiSkeleton class="h-4 w-2/3" />
          <UiSkeleton class="h-24" />
        </div>
      </div>
    </UiPanel>

    <VariantStockHeader
      v-else-if="variant"
      :variant="variant"
    >
      <template #actions>
        <UiButton
          icon="ph:tray-arrow-down"
          @click="open('entry')"
        >
          Registrar entrada
        </UiButton>
        <UiButton
          variant="secondary"
          icon="ph:tray-arrow-up"
          :disabled="variant.availableStock <= 0"
          :title="variant.availableStock <= 0 ? 'No hay unidades disponibles para sacar.' : undefined"
          @click="open('exit')"
        >
          Salida / merma
        </UiButton>
        <UiButton
          variant="secondary"
          icon="ph:clipboard-text"
          @click="open('count')"
        >
          Conteo físico
        </UiButton>
      </template>
    </VariantStockHeader>

    <UiAlert
      v-if="notice"
      tone="info"
    >
      {{ notice }}
    </UiAlert>

    <UiPanel
      v-if="!error"
      title="Kardex"
      description="Historial de movimientos de esta variante, del más reciente al más antiguo."
    >
      <div class="grid gap-5">
        <MovementsFilters
          id="variant-movements"
          v-model:type="movements.filters.type"
          v-model:date-from="movements.filters.dateFrom"
          v-model:date-to="movements.filters.dateTo"
          @clear="clearFilters"
        />

        <UiAlert v-if="movements.error">
          {{ movements.error }}
          <button
            type="button"
            class="ml-1 font-medium underline underline-offset-2"
            @click="movements.load()"
          >
            Reintentar
          </button>
        </UiAlert>

        <MovementsTableSkeleton v-if="movements.pending && !page" />

        <UiEmptyState
          v-else-if="page && !page.items.length"
          icon="ph:clock-counter-clockwise"
          :title="filtered ? 'Sin resultados' : 'Sin movimientos'"
          :description="filtered ? 'Ningún movimiento coincide con estos filtros.' : 'Cuando registres una entrada o salida aparecerá aquí.'"
        />

        <MovementsTable
          v-else-if="page"
          :items="page.items"
          :pending="movements.pending"
        />

        <UiPagination
          v-if="page"
          :page="page.page"
          :total-pages="page.totalPages"
          :total-elements="page.totalElements"
          :disabled="movements.pending"
          @change="movements.load"
        />
      </div>
    </UiPanel>

    <UiModal
      v-if="variant"
      v-model:open="modalOpen"
      :title="action ? modalCopy[action].title : ''"
      :description="action ? modalCopy[action].description : undefined"
    >
      <StockCountForm
        v-if="action === 'count'"
        :variant-id="variantId"
        :levels="variant"
        @saved="onSaved"
        @cancel="action = null"
      />
      <StockAdjustForm
        v-else-if="action"
        :key="action"
        :variant-id="variantId"
        :levels="variant"
        :mode="action"
        @saved="onSaved"
        @cancel="action = null"
      />
    </UiModal>
  </div>
</template>
