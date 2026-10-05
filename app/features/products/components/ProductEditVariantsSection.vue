<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { ColorSwatch } from '~/features/catalog'
import { PRODUCT_ROUTES } from '../constants'
import { useProductsApi } from '../services'
import { useProductEditStore } from '../stores/product-edit.store'
import type { ProductVariant } from '../types'
import ProductVariantModal from './ProductVariantModal.vue'

const store = useProductEditStore()
const api = useProductsApi()

const product = computed(() => store.product!)
const variants = computed(() => [...product.value.variants].sort((a, b) =>
  a.color.name.localeCompare(b.color.name, 'es') || a.size.sortOrder - b.size.sortOrder,
))
const activeCount = computed(() => variants.value.filter(v => v.active).length)
const stock = computed(() => variants.value.reduce((sum, v) => sum + v.availableStock, 0))

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const togglingId = ref<string | null>(null)
const notice = ref<string | null>(null)
const actionError = ref<string | null>(null)

const columns: TableColumn<ProductVariant>[] = [
  { id: 'variant', header: 'Variante' },
  { accessorKey: 'sku', header: 'SKU' },
  { id: 'price', header: 'Precio', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'costPrice', header: 'Costo', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'availableStock', header: 'Stock', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'active', header: 'Activa' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'w-px py-2' } } },
]

function openModal(variantId: string | null) {
  editingId.value = variantId
  notice.value = null
  actionError.value = null
  modalOpen.value = true
}

function onSaved(message: string) {
  modalOpen.value = false
  notice.value = message
}

async function toggleActive(variant: ProductVariant, active: boolean) {
  notice.value = null
  actionError.value = null
  // Un publicado sin variantes activas se veria en la tienda sin poder comprarse
  if (!active && product.value.status === 'PUBLISHED' && activeCount.value === 1) {
    actionError.value = 'Es la única variante activa de un artículo publicado. Pásalo a borrador o archívalo antes de desactivarla.'
    return
  }
  togglingId.value = variant.id
  try {
    await api.updateVariant(product.value.id, variant.id, { active })
    await store.refresh()
  }
  catch (e) {
    actionError.value = parseApiError(e).message
  }
  finally {
    togglingId.value = null
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <h2 class="font-semibold text-highlighted">
            Variantes
          </h2>
          <p class="text-sm text-muted">
            El stock se mueve desde Inventario: entradas, ajustes y conteos quedan en el kárdex.
          </p>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          icon="ph:plus"
          label="Agregar variante"
          @click="openModal(null)"
        />
      </div>
    </template>

    <div class="grid gap-5">
      <UAlert
        v-if="actionError"
        color="error"
        icon="ph:warning-circle"
        :title="actionError"
      />
      <UAlert
        v-else-if="notice"
        color="primary"
        icon="ph:info"
        :title="notice"
      />

      <UEmpty
        v-if="!variants.length"
        icon="ph:t-shirt"
        title="Sin variantes"
        description="Agrega al menos una combinación de talla y color para poder publicarlo."
      />

      <template v-else>
        <p class="text-sm text-muted">
          <span class="tabular-nums text-highlighted">{{ variants.length }}</span>
          {{ variants.length === 1 ? 'variante' : 'variantes' }},
          <span class="tabular-nums text-highlighted">{{ activeCount }}</span>
          {{ activeCount === 1 ? 'activa' : 'activas' }},
          <span class="tabular-nums text-highlighted">{{ stock }}</span> piezas disponibles
        </p>

        <UTable
          :data="variants"
          :columns="columns"
          class="-mx-4 sm:-mx-6"
        >
          <template #variant-cell="{ row }">
            <span
              class="flex min-w-40 items-center gap-3"
              :class="!row.original.active && 'opacity-60'"
            >
              <img
                v-if="row.original.imageUrl"
                :src="row.original.imageUrl"
                alt=""
                loading="lazy"
                class="aspect-[4/5] w-9 shrink-0 rounded-md border border-default object-cover"
              >
              <span
                v-else
                class="grid aspect-[4/5] w-9 shrink-0 place-items-center rounded-md bg-muted text-muted"
              >
                <UIcon
                  name="ph:image"
                  class="size-4"
                />
              </span>
              <span class="grid gap-0.5">
                <span class="flex items-center gap-2 font-medium text-highlighted">
                  <ColorSwatch
                    :hex="row.original.color.hex"
                    size="sm"
                  />
                  {{ row.original.color.name }} {{ row.original.size.name }}
                </span>
                <span
                  v-if="row.original.overrideImageUrl"
                  class="text-xs"
                >Foto propia</span>
              </span>
            </span>
          </template>
          <template #sku-cell="{ row }">
            <span class="font-mono text-highlighted">{{ row.original.sku }}</span>
          </template>
          <template #price-cell="{ row }">
            <span class="tabular-nums text-highlighted">{{ formatMoney(product.basePrice + row.original.priceAdjustment) }}</span>
            <span
              v-if="row.original.priceAdjustment"
              class="block text-xs tabular-nums"
            >{{ row.original.priceAdjustment > 0 ? '+' : '−' }}{{ formatMoney(Math.abs(row.original.priceAdjustment)) }}</span>
          </template>
          <template #costPrice-cell="{ row }">
            <span class="tabular-nums">{{ formatMoney(row.original.costPrice) }}</span>
          </template>
          <template #availableStock-cell="{ row }">
            <ULink
              :to="PRODUCT_ROUTES.inventoryVariant(row.original.id)"
              class="tabular-nums underline-offset-2 hover:underline"
              :class="row.original.availableStock ? 'text-highlighted' : 'font-medium text-error'"
              :title="`Inventario de ${row.original.sku}`"
            >
              {{ row.original.availableStock }}
            </ULink>
          </template>
          <template #active-cell="{ row }">
            <USwitch
              :model-value="row.original.active"
              :loading="togglingId === row.original.id"
              :disabled="Boolean(togglingId)"
              :aria-label="`${row.original.color.name} ${row.original.size.name} activa`"
              @update:model-value="toggleActive(row.original, $event)"
            />
          </template>
          <template #actions-cell="{ row }">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="ph:pencil-simple"
              :aria-label="`Editar ${row.original.color.name} ${row.original.size.name}`"
              @click="openModal(row.original.id)"
            />
          </template>
        </UTable>
      </template>
    </div>

    <ProductVariantModal
      v-model:open="modalOpen"
      :variant-id="editingId"
      @saved="onSaved"
    />
  </UCard>
</template>
