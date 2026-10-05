<script setup lang="ts">
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

const statusOptions = Object.entries(STATUS_LABELS) as [ProductStatus, string][]

const statusClasses: Record<ProductStatus, string> = {
  PUBLISHED: 'bg-accent/10 text-accent',
  DRAFT: 'bg-surface text-ink',
  ARCHIVED: 'bg-surface text-ink-muted',
}

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
  <UiPanel>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_11rem_15rem]">
        <UiSearch
          id="products-search"
          v-model="store.list.filters.name"
          label="Buscar artículo"
          class="sm:col-span-2 lg:col-span-1"
        />
        <div>
          <label
            for="products-status"
            class="sr-only"
          >Estado</label>
          <UiSelect
            id="products-status"
            v-model="store.list.filters.status"
            class="[&_select]:h-10 [&_select]:text-sm"
          >
            <option value="">
              Todos los estados
            </option>
            <option
              v-for="[value, label] in statusOptions"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </UiSelect>
        </div>
        <div>
          <label
            for="products-category"
            class="sr-only"
          >Categoría</label>
          <CategorySelect
            id="products-category"
            v-model="store.list.filters.categoryId"
            empty-label="Todas las categorías"
            class="[&_select]:h-10 [&_select]:text-sm"
          />
        </div>
      </div>

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
          <UiSkeleton class="h-14 w-11 shrink-0" />
          <div class="grid flex-1 gap-2">
            <UiSkeleton class="h-4 w-2/5" />
            <UiSkeleton class="h-3 w-1/4" />
          </div>
          <UiSkeleton class="hidden h-4 w-20 sm:block" />
          <UiSkeleton class="h-6 w-20" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="page && !items.length"
        icon="ph:coat-hanger"
        :title="filtered ? 'Sin resultados' : 'Aún no hay artículos'"
        :description="filtered ? 'Ningún artículo coincide con estos filtros.' : 'Crea el primero con sus tallas, colores y fotos.'"
      >
        <UiButton
          v-if="filtered"
          variant="secondary"
          size="sm"
          icon="ph:x"
          @click="clearFilters"
        >
          Limpiar filtros
        </UiButton>
        <UiButton
          v-else
          size="sm"
          icon="ph:plus"
          :to="PRODUCT_ROUTES.create"
        >
          Nuevo artículo
        </UiButton>
      </UiEmptyState>

      <div
        v-else-if="items.length"
        class="-mx-5 overflow-x-auto sm:-mx-6"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Artículo
              </th>
              <th class="pb-3 pr-4 font-medium">
                Categoría
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Precio base
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Stock
              </th>
              <th class="px-5 pb-3 text-right font-medium sm:px-6">
                Estado
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-line border-t border-line transition-opacity"
            :class="store.list.pending && 'opacity-60'"
            :aria-busy="store.list.pending || undefined"
          >
            <tr
              v-for="product in items"
              :key="product.id"
            >
              <td class="px-5 py-3 sm:px-6">
                <div class="flex min-w-56 items-center gap-3">
                  <img
                    v-if="thumbnail(product)"
                    :src="thumbnail(product)!"
                    alt=""
                    loading="lazy"
                    class="aspect-[4/5] w-11 shrink-0 rounded-lg border border-line object-cover"
                  >
                  <span
                    v-else
                    class="grid aspect-[4/5] w-11 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted"
                  >
                    <Icon
                      name="ph:image"
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span class="grid min-w-0">
                    <span class="truncate font-medium text-ink">{{ product.name }}</span>
                    <span class="truncate font-mono text-xs text-ink-muted">{{ product.slug }}</span>
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-ink-muted">
                {{ product.category?.name ?? 'Sin categoría' }}
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-right tabular-nums text-ink">
                {{ formatMoney(product.basePrice) }}
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-right tabular-nums">
                <template v-if="product.variants">
                  <span :class="stock(product) ? 'text-ink' : 'font-medium text-danger'">{{ stock(product) }}</span>
                  <span class="block text-xs text-ink-muted">
                    {{ product.variants.length }} {{ product.variants.length === 1 ? 'variante' : 'variantes' }}
                  </span>
                </template>
                <span
                  v-else
                  class="text-ink-muted"
                >-</span>
              </td>
              <td class="px-5 py-3 text-right sm:px-6">
                <span
                  class="inline-flex rounded-lg px-2 py-1 text-xs font-medium"
                  :class="statusClasses[product.status]"
                >
                  {{ STATUS_LABELS[product.status] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
