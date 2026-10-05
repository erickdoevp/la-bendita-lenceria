<script setup lang="ts">
import type { ResolvedCategory } from '~/features/store-catalog'
import { ProductCard, ProductCardSkeleton, STORE_ROUTES } from '~/features/store-catalog'
import { LISTING_PAGE_SIZE } from '../constants'
import { useCategoryListing } from '../composables/useCategoryListing'
import { useListingQuery } from '../composables/useListingQuery'
import ListingActiveFilters from './ListingActiveFilters.vue'
import ListingFilters from './ListingFilters.vue'
import ListingFiltersDrawer from './ListingFiltersDrawer.vue'
import ListingHeader from './ListingHeader.vue'
import ListingPagination from './ListingPagination.vue'
import ListingToolbar from './ListingToolbar.vue'

const props = defineProps<{ resolved: ResolvedCategory }>()

const { state, activeCount, clearFilters } = useListingQuery()
const { result, initialLoading, refreshing, errorMessage, refresh } = await useCategoryListing(
  toRef(props, 'resolved'),
  state,
)

const filtersOpen = ref(false)
const resultsTop = useTemplateRef<HTMLElement>('resultsTop')

// Al cambiar de pagina se sube al inicio de los resultados, no al tope de la pagina
watch(() => state.value.page, () => {
  if (!import.meta.client || !resultsTop.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resultsTop.value.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
})

const rootPath = computed(() => STORE_ROUTES.category(props.resolved.trail[0]!.slug))
const isRoot = computed(() => props.resolved.trail.length === 1)
</script>

<template>
  <div>
    <ListingHeader :resolved="resolved" />

    <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:pt-10">
      <!-- Panel lateral solo en escritorio; en movil los filtros abren un dialogo -->
      <aside
        class="hidden lg:block"
        aria-label="Filtros"
      >
        <div class="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
          <h2 class="pb-1 text-lg font-semibold tracking-tight text-ink">
            Filtrar
          </h2>
          <ListingFilters
            v-if="result"
            :facets="result.facets"
            id-prefix="sidebar"
          />
          <div
            v-else
            class="grid gap-4 pt-4"
            aria-hidden="true"
          >
            <UiSkeleton
              v-for="n in 4"
              :key="n"
              class="h-24"
            />
          </div>
        </div>
      </aside>

      <section
        aria-label="Productos"
        class="grid min-w-0 content-start gap-6"
      >
        <div
          ref="resultsTop"
          class="grid scroll-mt-24 gap-4"
        >
          <ListingToolbar
            :total-items="result?.totalItems ?? null"
            @open-filters="filtersOpen = true"
          />
          <ListingActiveFilters
            v-if="result"
            :facets="result.facets"
          />
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line px-5 py-6"
        >
          <div class="flex items-start gap-3">
            <Icon
              name="ph:warning-circle"
              class="mt-0.5 size-5 shrink-0 text-danger"
              aria-hidden="true"
            />
            <p class="max-w-[52ch] text-sm leading-relaxed text-ink-muted">
              {{ errorMessage }}
            </p>
          </div>
          <UiButton
            variant="secondary"
            size="sm"
            icon="ph:arrow-clockwise"
            @click="refresh()"
          >
            Reintentar
          </UiButton>
        </div>

        <ul
          v-else-if="initialLoading"
          class="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10"
          aria-hidden="true"
        >
          <li
            v-for="n in LISTING_PAGE_SIZE"
            :key="n"
          >
            <ProductCardSkeleton />
          </li>
        </ul>

        <!-- Sin resultados con filtros: se ofrece quitarlos. Sin productos en la categoria: volver a la raiz -->
        <UiEmptyState
          v-else-if="result && !result.products.length && activeCount"
          icon="ph:funnel-x"
          title="Ningún producto coincide con estos filtros"
          description="Prueba con otra talla o color, o quita algún filtro para ver más opciones."
        >
          <UiButton
            variant="secondary"
            size="sm"
            @click="clearFilters()"
          >
            Limpiar filtros
          </UiButton>
        </UiEmptyState>

        <UiEmptyState
          v-else-if="result && !result.products.length"
          icon="ph:coat-hanger"
          :title="`Aún no hay productos en ${resolved.category.name.toLowerCase()}`"
          description="Estamos preparando esta sección. Mientras tanto, revisa el resto de la categoría."
        >
          <UiButton
            v-if="!isRoot"
            variant="secondary"
            size="sm"
            :to="rootPath"
          >
            Ver {{ resolved.trail[0]!.name.toLowerCase() }}
          </UiButton>
        </UiEmptyState>

        <ul
          v-else-if="result"
          class="grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity duration-300 md:grid-cols-3 md:gap-x-6 md:gap-y-10"
          :class="{ 'pointer-events-none opacity-50': refreshing }"
          :aria-busy="refreshing || undefined"
        >
          <li
            v-for="(product, index) in result.products"
            :key="product.id"
          >
            <ProductCard
              :product="product"
              :eager="index < 3"
            />
          </li>
        </ul>

        <ListingPagination
          v-if="result && result.products.length"
          class="pt-6"
          :page="result.page"
          :total-pages="result.totalPages"
        />
      </section>
    </div>

    <ListingFiltersDrawer
      v-if="result"
      v-model:open="filtersOpen"
      :facets="result.facets"
      :total-items="result.totalItems"
      :pending="refreshing"
    />
  </div>
</template>
