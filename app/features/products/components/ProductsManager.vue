<script setup lang="ts">
import type { BadgeProps, TableColumn } from '@nuxt/ui'
import { CategorySelect, useCategoriesStore } from '~/features/catalog'
import { PRODUCT_ROUTES, STATUS_LABELS } from '../constants'
import { useProductsListStore } from '../stores/products-list.store'
import type { ProductListItem, ProductStatus } from '../types'

const store = useProductsListStore()
const categories = useCategoriesStore()

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filters = computed(() => store.list.filters)
const filtered = computed(() => Boolean(filters.value.name || filters.value.status || filters.value.categoryId))


const search = useSearchTerm(() => store.list.filters.name, (value) => {
  store.list.filters.name = value
})
const status = useSelectAll(store.list.filters, 'status')
const statusItems = [
  { label: 'Todos los estados', value: SELECT_ALL },
  ...(Object.entries(STATUS_LABELS) as [ProductStatus, string][]).map(([value, label]) => ({ label, value })),
]

const statusColors: Record<ProductStatus, BadgeProps['color']> = {
  PUBLISHED: 'primary',
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',
}

const columns: TableColumn<ProductListItem>[] = [
  { accessorKey: 'name', header: 'Artículo' },
  { id: 'category', header: 'Categoría' },
  { accessorKey: 'basePrice', header: 'Precio base', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { id: 'stock', header: 'Stock', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'status', header: 'Estado', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

onMounted(() => {
  categories.fetchTree()
  store.list.load()
})

watch(
  () => [filters.value.name, filters.value.status, filters.value.categoryId],
  () => store.list.load(0),
)

function clearFilters() {
  Object.assign(store.list.filters, { name: '', status: '', categoryId: '' })
}

/** Misma prioridad que la tienda: principal general, luego la de cualquier color. */
function thumbnail(product: ProductListItem) {
  const images = product.images ?? []
  return images.find(i => i.isPrimary && !i.colorId)?.url
    ?? images.find(i => i.isPrimary)?.url
    ?? images[0]?.url
    ?? product.variants?.find(v => v.imageUrl)?.imageUrl
    ?? null
}

function stock(product: ProductListItem) {
  return product.variants?.reduce((sum, v) => sum + v.availableStock, 0)
}
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_11rem_15rem]">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar artículo"
          aria-label="Buscar artículo"
          class="sm:col-span-2 lg:col-span-1"
        />
        <USelect
          v-model="status"
          :items="statusItems"
          aria-label="Estado"
        />
        <CategorySelect
          v-model="store.list.filters.categoryId"
          empty-label="Todas las categorías"
          aria-label="Categoría"
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
        aria-label="Cargando artículos"
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
            class="hidden h-4 w-20 sm:block"
          />
          <USkeleton
            class="h-6 w-20"
          />
        </div>
      </div>

      <UEmpty
        v-else-if="page && !items.length"
        icon="ph:coat-hanger"
        :title="filtered ? 'Sin resultados' : 'Aún no hay artículos'"
        :description="filtered ? 'Ningún artículo coincide con estos filtros.' : 'Crea el primero con sus tallas, colores y fotos.'"
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
          <UButton
            v-else
            size="sm"
            icon="ph:plus"
            :to="PRODUCT_ROUTES.create"
            label="Nuevo artículo"
          />
      
        </template>
      </UEmpty>

      <UTable
        v-else-if="items.length"
        :data="items"
        :columns="columns"
        :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        :aria-busy="store.list.pending || undefined"
      >
        <template #name-cell="{ row }">
          <div class="flex min-w-56 items-center gap-3">
            <img
              v-if="thumbnail(row.original)"
              :src="thumbnail(row.original)!"
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
            <span class="grid min-w-0">
              <span class="truncate font-medium text-highlighted">{{ row.original.name }}</span>
              <span class="truncate font-mono text-xs">{{ row.original.slug }}</span>
            </span>
          </div>
        </template>
        <template #category-cell="{ row }">
          {{ row.original.category?.name ?? 'Sin categoría' }}
        </template>
        <template #basePrice-cell="{ row }">
          <span class="tabular-nums text-highlighted">{{ formatMoney(row.original.basePrice) }}</span>
        </template>
        <template #stock-cell="{ row }">
          <template v-if="row.original.variants">
            <span
              class="tabular-nums"
              :class="stock(row.original) ? 'text-highlighted' : 'font-medium text-error'"
            >{{ stock(row.original) }}</span>
            <span class="block text-xs">
              {{ row.original.variants.length }} {{ row.original.variants.length === 1 ? 'variante' : 'variantes' }}
            </span>
          </template>
          <span v-else>-</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge
            :color="statusColors[row.original.status]"
            :label="STATUS_LABELS[row.original.status]"
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
