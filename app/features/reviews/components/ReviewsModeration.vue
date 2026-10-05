<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
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

const sortItems = (Object.entries(REVIEW_SORTS) as [ReviewSort, { label: string }][]).map(([value, option]) => ({ label: option.label, value }))

const approved = useSelectAll(store.all.filters, 'approved')
const rating = useSelectAll(store.all.filters, 'rating')
const verified = useSelectAll(store.all.filters, 'verifiedPurchase')
const approvedItems = [
  { label: 'Todas', value: SELECT_ALL },
  { label: 'Publicadas', value: 'true' },
  { label: 'Pendientes', value: 'false' },
]
const ratingItems = [
  { label: 'Todas', value: SELECT_ALL },
  ...[5, 4, 3, 2, 1].map(star => ({ label: `${star} ${star === 1 ? 'estrella' : 'estrellas'}`, value: String(star) })),
]
const verifiedItems = [
  { label: 'Todas', value: SELECT_ALL },
  { label: 'Verificada', value: 'true' },
  { label: 'Sin verificar', value: 'false' },
]

const tabs = computed<TabsItem[]>(() => [
  { value: 'pending', label: 'Pendientes', badge: store.pendingCount ? { label: String(store.pendingCount), color: 'primary', variant: 'solid' } : undefined },
  { value: 'all', label: 'Todas' },
])
const tab = computed({
  get: () => store.tab,
  set: (value: string | number) => {
    store.tab = value as ModerationTab
  },
})

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
  <UCard>
    <div class="grid gap-5">
      <UTabs
        v-model="tab"
        :items="tabs"
        :content="false"
        variant="link"
        aria-label="Vista de reseñas"
        class="-mx-4 sm:-mx-6"
        :ui="{ list: 'px-4 sm:px-6' }"
      />

      <template v-if="store.tab === 'all'">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <UFormField
            label="Estado"
            :ui="{ label: 'text-xs text-muted' }"
          >
            <USelect
              v-model="approved"
              :items="approvedItems"
            />
          </UFormField>
          <UFormField
            label="Calificación"
            :ui="{ label: 'text-xs text-muted' }"
          >
            <USelect
              v-model="rating"
              :items="ratingItems"
            />
          </UFormField>
          <UFormField
            label="Compra"
            :ui="{ label: 'text-xs text-muted' }"
          >
            <USelect
              v-model="verified"
              :items="verifiedItems"
            />
          </UFormField>
          <UFormField
            label="Orden"
            :ui="{ label: 'text-xs text-muted' }"
          >
            <USelect
              v-model="store.all.filters.sort"
              :items="sortItems"
            />
          </UFormField>
        </div>

        <div
          v-if="filters.productId || filtering"
          class="flex flex-wrap items-center gap-2 text-sm"
        >
          <UBadge
            v-if="filters.productId"
            :label="productName ?? 'Artículo seleccionado'"
          >
            <template #trailing>
              <UButton
                variant="link"
                size="xs"
                icon="ph:x"
                class="p-0"
                aria-label="Quitar filtro de artículo"
                @click="store.all.filters.productId = ''; productName = null"
              />
            </template>
          </UBadge>
          <UButton
            v-if="filtering"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="ph:x"
            label="Limpiar filtros"
            @click="clearFilters"
          />
        </div>

        <ReviewStatsSummary
          v-if="filters.productId"
          ref="stats"
          :product-id="filters.productId"
        />
      </template>

      <p
        v-else
        class="text-sm text-muted"
      >
        Las más antiguas primero. Incluye reseñas editadas, que vuelven a revisión. Hasta aprobarlas no se ven en la tienda.
      </p>

      <UAlert
        v-if="actionError || list.error"
        color="error"
        icon="ph:warning-circle"
        :title="actionError ?? list.error ?? undefined"
        :actions="list.error ? retryAction(() => list.load()) : undefined"
        orientation="horizontal"
      />
      <UAlert
        v-else-if="notice"
        color="primary"
        icon="ph:info"
        :title="notice"
      />

      <div
        v-if="store.tab === 'pending' && items.length"
        class="flex min-h-9 flex-wrap items-center gap-3 text-sm"
      >
        <UCheckbox
          :model-value="allSelected ? true : selected.size ? 'indeterminate' : false"
          :label="selected.size ? `${selected.size} seleccionada(s)` : 'Seleccionar todas en esta página'"
          :disabled="bulkPending"
          :ui="{ label: 'font-normal text-muted' }"
          @update:model-value="toggleAll"
        />
        <UButton
          v-if="selected.size"
          size="sm"
          icon="ph:checks"
          :loading="bulkPending"
          label="Aprobar seleccionadas"
          @click="onApproveSelected"
        />
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
          <USkeleton
            class="h-15 w-12 shrink-0"
          />
          <div class="grid flex-1 gap-2">
            <USkeleton
              class="h-4 w-48"
            />
            <USkeleton
              class="h-3 w-32"
            />
            <USkeleton
              class="h-10"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-else-if="page && !items.length"
        :icon="store.tab === 'pending' ? 'ph:check-circle' : 'ph:chat-centered-text'"
        :title="store.tab === 'pending' ? 'Nada pendiente' : filtering ? 'Sin resultados' : 'Aún no hay reseñas'"
        :description="store.tab === 'pending'
          ? 'Todas las reseñas están revisadas.'
          : filtering ? 'Ninguna reseña coincide con estos filtros.' : 'Las reseñas de las clientas aparecerán aquí.'"
      />

      <div
        v-else-if="items.length"
        class="-mx-4 divide-y divide-default border-y border-default transition-opacity sm:-mx-6"
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

      <PagePagination
        v-if="page"
        :page="page"
        :disabled="list.pending"
        @change="list.load"
      />
    </div>
  </UCard>
</template>
