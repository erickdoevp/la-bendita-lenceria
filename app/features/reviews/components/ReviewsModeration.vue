<script setup lang="ts">
import { REVIEW_SORTS, emptyReviewFilters } from '../constants'
import { useReviewsStore } from '../stores/reviews.store'
import type { ModerationTab, Review, ReviewSort } from '../types'
import ReviewCard from './ReviewCard.vue'
import ReviewStatsSummary from './ReviewStatsSummary.vue'

const store = useReviewsStore()
const route = useRoute()

const approvingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const bulkPending = ref(false)
const selected = ref(new Set<string>())
const actionError = ref<string | null>(null)
const notice = ref<string | null>(null)
/** Nombre del articulo filtrado, para la etiqueta del filtro (la API solo recibe el id). */
const productName = ref<string | null>(null)
const stats = ref<{ load: () => Promise<void> } | null>(null)

const list = computed(() => (store.tab === 'pending' ? store.pending : store.all))
const page = computed(() => list.value.data)
const items = computed(() => page.value?.items ?? [])
const filters = computed(() => store.all.filters)
const filtering = computed(() => Boolean(
  filters.value.approved || filters.value.rating || filters.value.verifiedPurchase || filters.value.productId,
))
const allSelected = computed(() => items.value.length > 0 && items.value.every(r => selected.value.has(r.id)))

const sortOptions = Object.entries(REVIEW_SORTS) as [ReviewSort, { label: string }][]

const tabs = computed<{ value: ModerationTab, label: string, count?: number | null }[]>(() => [
  { value: 'pending', label: 'Pendientes', count: store.pendingCount },
  { value: 'all', label: 'Todas' },
])

onMounted(() => {
  // ?productId= permite enlazar "todas las reseñas de este articulo"
  const productId = typeof route.query.productId === 'string' ? route.query.productId : ''
  if (productId) {
    store.tab = 'all'
    store.all.filters.productId = productId
  }
  store.pending.load()
  if (store.tab === 'all') store.all.load(0)
})

watch(() => store.tab, (tab) => {
  selected.value = new Set()
  actionError.value = null
  if (tab === 'all' && !store.all.data) store.all.load(0)
})

watch(
  () => [filters.value.approved, filters.value.rating, filters.value.verifiedPurchase, filters.value.productId, filters.value.sort],
  () => store.all.load(0),
)

// Las filas que ya no estan (aprobadas o borradas) salen de la seleccion
watch(items, (current) => {
  const ids = new Set(current.map(r => r.id))
  selected.value = new Set([...selected.value].filter(id => ids.has(id)))
  if (filters.value.productId && current[0]?.productId === filters.value.productId) {
    productName.value = current[0].productName
  }
})

function toggle(reviewId: string) {
  const next = new Set(selected.value)
  if (next.has(reviewId)) next.delete(reviewId)
  else next.add(reviewId)
  selected.value = next
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(items.value.map(r => r.id))
}

function filterProduct(review: Review) {
  productName.value = review.productName
  store.all.filters.productId = review.productId
  store.tab = 'all'
}

function clearFilters() {
  Object.assign(store.all.filters, emptyReviewFilters(), { sort: filters.value.sort })
  productName.value = null
}

async function run(action: () => Promise<void>, message: string) {
  actionError.value = null
  notice.value = null
  try {
    await action()
    notice.value = message
    void stats.value?.load()
  }
  catch (e) {
    actionError.value = parseApiError(e).message
  }
}

async function onApprove(review: Review) {
  approvingId.value = review.id
  await run(async () => {
    await store.approve(review.id)
  }, 'Reseña aprobada: ya se ve en la tienda.')
  approvingId.value = null
}

async function onRemove(review: Review) {
  deletingId.value = review.id
  await run(() => store.remove(review.id), 'Reseña borrada. La clienta puede escribir otra.')
  deletingId.value = null
}

async function onApproveSelected() {
  const ids = [...selected.value]
  bulkPending.value = true
  actionError.value = null
  notice.value = null
  // approveMany no lanza: devuelve cuantas fallaron
  const failed = await store.approveMany(ids)
  if (failed) actionError.value = `${failed} de ${ids.length} no se pudieron aprobar. Intenta de nuevo.`
  else notice.value = ids.length === 1 ? 'Reseña aprobada.' : `${ids.length} reseñas aprobadas.`
  void stats.value?.load()
  bulkPending.value = false
}
</script>

<template>
  <UiPanel>
    <div class="grid gap-5">
      <div
        class="-mx-5 flex gap-1 border-b border-line px-5 sm:-mx-6 sm:px-6"
        role="tablist"
        aria-label="Vista de reseñas"
      >
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          role="tab"
          :aria-selected="store.tab === item.value"
          class="-mb-px inline-flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          :class="store.tab === item.value ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink'"
          @click="store.tab = item.value"
        >
          {{ item.label }}
          <span
            v-if="item.count"
            class="rounded-full bg-accent px-1.5 text-xs tabular-nums text-accent-ink"
          >{{ item.count }}</span>
        </button>
      </div>

      <template v-if="store.tab === 'all'">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="grid gap-1.5">
            <label
              for="reviews-approved"
              class="text-xs font-medium text-ink-muted"
            >Estado</label>
            <UiSelect
              id="reviews-approved"
              v-model="store.all.filters.approved"
              class="[&_select]:h-10 [&_select]:text-sm"
            >
              <option value="">
                Todas
              </option>
              <option value="true">
                Publicadas
              </option>
              <option value="false">
                Pendientes
              </option>
            </UiSelect>
          </div>
          <div class="grid gap-1.5">
            <label
              for="reviews-rating"
              class="text-xs font-medium text-ink-muted"
            >Calificación</label>
            <UiSelect
              id="reviews-rating"
              v-model="store.all.filters.rating"
              class="[&_select]:h-10 [&_select]:text-sm"
            >
              <option value="">
                Todas
              </option>
              <option
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                :value="String(star)"
              >
                {{ star }} {{ star === 1 ? 'estrella' : 'estrellas' }}
              </option>
            </UiSelect>
          </div>
          <div class="grid gap-1.5">
            <label
              for="reviews-verified"
              class="text-xs font-medium text-ink-muted"
            >Compra</label>
            <UiSelect
              id="reviews-verified"
              v-model="store.all.filters.verifiedPurchase"
              class="[&_select]:h-10 [&_select]:text-sm"
            >
              <option value="">
                Todas
              </option>
              <option value="true">
                Verificada
              </option>
              <option value="false">
                Sin verificar
              </option>
            </UiSelect>
          </div>
          <div class="grid gap-1.5">
            <label
              for="reviews-sort"
              class="text-xs font-medium text-ink-muted"
            >Orden</label>
            <UiSelect
              id="reviews-sort"
              v-model="store.all.filters.sort"
              class="[&_select]:h-10 [&_select]:text-sm"
            >
              <option
                v-for="[value, option] in sortOptions"
                :key="value"
                :value="value"
              >
                {{ option.label }}
              </option>
            </UiSelect>
          </div>
        </div>

        <div
          v-if="filters.productId || filtering"
          class="flex flex-wrap items-center gap-2 text-sm"
        >
          <span
            v-if="filters.productId"
            class="inline-flex items-center gap-1 rounded-lg bg-accent/10 py-1 pl-2 pr-1 text-xs text-accent"
          >
            {{ productName ?? 'Artículo seleccionado' }}
            <button
              type="button"
              class="grid size-5 place-items-center rounded-md hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent"
              aria-label="Quitar filtro de artículo"
              @click="store.all.filters.productId = ''; productName = null"
            >
              <Icon
                name="ph:x"
                class="size-3"
                aria-hidden="true"
              />
            </button>
          </span>
          <UiButton
            v-if="filtering"
            variant="ghost"
            size="sm"
            icon="ph:x"
            @click="clearFilters"
          >
            Limpiar filtros
          </UiButton>
        </div>

        <ReviewStatsSummary
          v-if="filters.productId"
          ref="stats"
          :product-id="filters.productId"
        />
      </template>

      <p
        v-else
        class="text-sm text-ink-muted"
      >
        Las más antiguas primero. Incluye reseñas editadas, que vuelven a revisión. Hasta aprobarlas no se ven en la tienda.
      </p>

      <UiAlert v-if="actionError || list.error">
        {{ actionError ?? list.error }}
        <button
          v-if="list.error"
          type="button"
          class="ml-1 font-medium underline underline-offset-2"
          @click="list.load()"
        >
          Reintentar
        </button>
      </UiAlert>
      <UiAlert
        v-else-if="notice"
        tone="info"
      >
        {{ notice }}
      </UiAlert>

      <div
        v-if="store.tab === 'pending' && items.length"
        class="flex min-h-9 flex-wrap items-center gap-3 text-sm"
      >
        <label class="inline-flex cursor-pointer items-center gap-2 text-ink-muted">
          <input
            type="checkbox"
            class="size-4 accent-[var(--accent)]"
            :checked="allSelected"
            :indeterminate="selected.size > 0 && !allSelected"
            :disabled="bulkPending"
            @change="toggleAll"
          >
          {{ selected.size ? `${selected.size} seleccionada(s)` : 'Seleccionar todas en esta página' }}
        </label>
        <UiButton
          v-if="selected.size"
          size="sm"
          icon="ph:checks"
          :loading="bulkPending"
          @click="onApproveSelected"
        >
          Aprobar seleccionadas
        </UiButton>
      </div>

      <div
        v-if="list.pending && !page"
        class="grid gap-5"
        role="status"
        aria-label="Cargando reseñas"
      >
        <div
          v-for="row in 4"
          :key="row"
          class="flex gap-4"
        >
          <UiSkeleton class="h-15 w-12 shrink-0" />
          <div class="grid flex-1 gap-2">
            <UiSkeleton class="h-4 w-48" />
            <UiSkeleton class="h-3 w-32" />
            <UiSkeleton class="h-10" />
          </div>
        </div>
      </div>

      <UiEmptyState
        v-else-if="page && !items.length"
        :icon="store.tab === 'pending' ? 'ph:check-circle' : 'ph:chat-centered-text'"
        :title="store.tab === 'pending' ? 'Nada pendiente' : filtering ? 'Sin resultados' : 'Aún no hay reseñas'"
        :description="store.tab === 'pending'
          ? 'Todas las reseñas están revisadas.'
          : filtering ? 'Ninguna reseña coincide con estos filtros.' : 'Las reseñas de las clientas aparecerán aquí.'"
      />

      <div
        v-else-if="items.length"
        class="-mx-5 divide-y divide-line border-y border-line transition-opacity sm:-mx-6"
        :class="list.pending && 'opacity-60'"
        :aria-busy="list.pending || undefined"
      >
        <ReviewCard
          v-for="review in items"
          :key="review.id"
          :review="review"
          :selectable="store.tab === 'pending'"
          :selected="selected.has(review.id)"
          :show-status="store.tab === 'all'"
          :approving="approvingId === review.id || (bulkPending && selected.has(review.id))"
          :deleting="deletingId === review.id"
          @toggle="toggle(review.id)"
          @approve="onApprove(review)"
          @remove="onRemove(review)"
          @filter-product="filterProduct(review)"
        />
      </div>

      <UiPagination
        v-if="page"
        :page="page.page"
        :total-pages="page.totalPages"
        :total-elements="page.totalElements"
        :disabled="list.pending"
        @change="list.load"
      />
    </div>
  </UiPanel>
</template>
