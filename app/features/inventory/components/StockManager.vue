<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { ColorSwatch } from '~/features/catalog'
import { STATUS_LABELS } from '~/features/products'
import type { ProductStatus } from '~/features/products'
import { INVENTORY_ROUTES } from '../constants'
import { useStockListStore } from '../stores/stock-list.store'
import StockStatusBadge from './StockStatusBadge.vue'

const store = useStockListStore()

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filters = computed(() => store.list.filters)
const filtered = computed(() => Boolean(filters.value.productName || filters.value.sku || filters.value.status))

const productName = useSearchTerm(() => store.list.filters.productName, (value) => {
  store.list.filters.productName = value
})
const sku = useSearchTerm(() => store.list.filters.sku, (value) => {
  store.list.filters.sku = value
})
const status = useSelectAll(store.list.filters, 'status')
const statusItems = [
  { label: 'Todos los estados', value: SELECT_ALL },
  ...(Object.entries(STATUS_LABELS) as [ProductStatus, string][]).map(([value, label]) => ({ label, value })),
]

type StockRow = NonNullable<typeof page.value>['items'][number]

const columns: TableColumn<StockRow>[] = [
  { accessorKey: 'productName', header: 'Variante' },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'stock', header: 'Stock', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'reservedStock', header: 'Reservado', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'availableStock', header: 'Disponible', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { id: 'status', header: 'Estado', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

function onSelect(_event: Event, row: TableRow<StockRow>) {
  navigateTo(INVENTORY_ROUTES.variant(row.original.variantId))
}

onMounted(() => store.list.load())

watch(
  () => [filters.value.productName, filters.value.sku, filters.value.status],
  () => store.list.load(0),
)

function clearFilters() {
  Object.assign(store.list.filters, { productName: '', sku: '', status: '' })
}
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_11rem]">
        <UInput
          v-model="productName"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar artículo"
          aria-label="Buscar artículo"
        />
        <UInput
          v-model="sku"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar SKU"
          aria-label="Buscar SKU"
        />
        <USelect
          v-model="status"
          :items="statusItems"
          aria-label="Estado del artículo"
          class="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <UAlert
        v-if="store.list.error"
        color="error"
        icon="ph:warning-circle"
        :title="store.list.error"
        :actions="retryAction(() => store.list.load())"
        orientation="horizontal"
      />

      <div
        v-if="store.list.pending && !page"
        class="grid gap-4"
        role="status"
        aria-label="Cargando existencias"
      >
        <div
          v-for="row in 6"
          :key="row"
          class="flex items-center gap-4"
        >
          <USkeleton
            class="h-14 w-11 shrink-0"
          />
          <div class="grid flex-1 gap-2">
            <USkeleton
              class="h-4 w-2/5"
            />
            <USkeleton
              class="h-3 w-1/4"
            />
          </div>
          <USkeleton
            class="hidden h-4 w-32 sm:block"
          />
          <USkeleton
            class="h-6 w-20"
          />
        </div>
      </div>

      <UEmpty
        v-else-if="page && !items.length"
        icon="ph:package"
        :title="filtered ? 'Sin resultados' : 'Aún no hay variantes'"
        :description="filtered ? 'Ninguna variante coincide con estos filtros.' : 'El inventario se crea solo al dar de alta las variantes de un artículo.'"
      >
        <template #actions>
          <UButton
            v-if="filtered"
            color="neutral"
            variant="outline"
            size="sm"
            icon="ph:x"
            label="Limpiar filtros"
            @click="clearFilters"
          />
      
        </template>
      </UEmpty>

      <UTable
        v-else-if="items.length"
        :data="items"
        :columns="columns"
        :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        :aria-busy="store.list.pending || undefined"
        @select="onSelect"
      >
        <template #productName-cell="{ row }">
          <div
            class="flex min-w-56 items-center gap-3"
            :class="!row.original.active && 'opacity-70'"
          >
            <img
              v-if="row.original.imageUrl"
              :src="row.original.imageUrl"
              alt=""
              loading="lazy"
              class="aspect-[4/5] w-11 shrink-0 rounded-lg border border-default object-cover"
            >
            <span
              v-else
              class="grid aspect-[4/5] w-11 shrink-0 place-items-center rounded-lg bg-muted text-muted"
            >
              <UIcon
                name="ph:image"
                class="size-4"
              />
            </span>
            <span class="grid min-w-0 gap-0.5">
              <NuxtLink
                :to="INVENTORY_ROUTES.variant(row.original.variantId)"
                class="truncate font-medium text-highlighted hover:underline"
                @click.stop
              >{{ row.original.productName }}</NuxtLink>
              <span class="flex items-center gap-1.5 text-xs">
                <ColorSwatch
                  :hex="row.original.colorHex"
                  size="sm"
                />
                {{ row.original.colorName }} · {{ row.original.sizeName }}
                <span v-if="!row.original.active">· Inactiva</span>
              </span>
            </span>
          </div>
        </template>
        <template #sku-cell="{ row }">
          <span class="font-mono text-xs">{{ row.original.sku }}</span>
        </template>
        <template #stock-cell="{ row }">
          <span class="tabular-nums text-highlighted">{{ row.original.stock }}</span>
        </template>
        <template #reservedStock-cell="{ row }">
          <span class="tabular-nums">{{ row.original.reservedStock }}</span>
        </template>
        <template #availableStock-cell="{ row }">
          <span
            class="font-semibold tabular-nums"
            :class="row.original.availableStock <= 0 ? 'text-error' : row.original.lowStock ? 'text-warning' : 'text-highlighted'"
          >{{ row.original.availableStock }}</span>
        </template>
        <template #status-cell="{ row }">
          <StockStatusBadge
            :available-stock="row.original.availableStock"
            :low-stock="row.original.lowStock"
          />
        </template>
      </UTable>

      <PagePagination
        v-if="page"
        :page="page"
        :disabled="store.list.pending"
        @change="store.list.load"
      />
    </div>
  </UCard>
</template>
