<script setup lang="ts">
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

const statusOptions = Object.entries(STATUS_LABELS) as [ProductStatus, string][]

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
  <UiPanel>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_11rem]">
        <UiSearch
          id="stock-search-name"
          v-model="store.list.filters.productName"
          label="Buscar artículo"
        />
        <UiSearch
          id="stock-search-sku"
          v-model="store.list.filters.sku"
          label="Buscar SKU"
        />
        <div class="sm:col-span-2 lg:col-span-1">
          <label
            for="stock-status"
            class="sr-only"
          >Estado del artículo</label>
          <UiSelect
            id="stock-status"
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
        aria-label="Cargando existencias"
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
          <UiSkeleton class="hidden h-4 w-32 sm:block" />
          <UiSkeleton class="h-6 w-20" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="page && !items.length"
        icon="ph:package"
        :title="filtered ? 'Sin resultados' : 'Aún no hay variantes'"
        :description="filtered ? 'Ninguna variante coincide con estos filtros.' : 'El inventario se crea solo al dar de alta las variantes de un artículo.'"
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
      </UiEmptyState>

      <div
        v-else-if="items.length"
        class="-mx-5 overflow-x-auto sm:-mx-6"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Variante
              </th>
              <th class="pb-3 pr-4 font-medium">
                SKU
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Stock
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Reservado
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Disponible
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
              v-for="variant in items"
              :key="variant.variantId"
              class="cursor-pointer transition-colors hover:bg-surface"
              :class="!variant.active && 'text-ink-muted'"
              @click="navigateTo(INVENTORY_ROUTES.variant(variant.variantId))"
            >
              <td class="px-5 py-3 sm:px-6">
                <div class="flex min-w-56 items-center gap-3">
                  <img
                    v-if="variant.imageUrl"
                    :src="variant.imageUrl"
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
                  <span class="grid min-w-0 gap-0.5">
                    <NuxtLink
                      :to="INVENTORY_ROUTES.variant(variant.variantId)"
                      class="truncate rounded-md font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                      @click.stop
                    >{{ variant.productName }}</NuxtLink>
                    <span class="flex items-center gap-1.5 text-xs text-ink-muted">
                      <ColorSwatch
                        :hex="variant.colorHex"
                        size="sm"
                      />
                      {{ variant.colorName }} · {{ variant.sizeName }}
                      <span v-if="!variant.active">· Inactiva</span>
                    </span>
                  </span>
                </div>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 font-mono text-xs text-ink-muted">
                {{ variant.sku }}
              </td>
              <td class="py-3 pr-4 text-right tabular-nums text-ink">
                {{ variant.stock }}
              </td>
              <td class="py-3 pr-4 text-right tabular-nums text-ink-muted">
                {{ variant.reservedStock }}
              </td>
              <td
                class="py-3 pr-4 text-right font-semibold tabular-nums"
                :class="variant.availableStock <= 0 ? 'text-danger' : variant.lowStock ? 'text-warning' : 'text-ink'"
              >
                {{ variant.availableStock }}
              </td>
              <td class="px-5 py-3 text-right sm:px-6">
                <StockStatusBadge
                  :available-stock="variant.availableStock"
                  :low-stock="variant.lowStock"
                />
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
