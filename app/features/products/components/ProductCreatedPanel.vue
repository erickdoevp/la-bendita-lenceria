<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { ColorSwatch } from '~/features/catalog'
import { STATUS_LABELS } from '../constants'
import type { ProductDetail } from '../types'

const props = defineProps<{ product: ProductDetail }>()
const emit = defineEmits<{ createAnother: [] }>()

const heading = ref<HTMLElement | null>(null)
onMounted(() => heading.value?.focus())

const variants = computed(() => [...props.product.variants].sort((a, b) =>
  a.color.name.localeCompare(b.color.name, 'es') || a.size.sortOrder - b.size.sortOrder,
))
const primaryImage = computed(() =>
  props.product.images.find(i => i.isPrimary && !i.colorId)?.url
  ?? props.product.images.find(i => i.isPrimary)?.url
  ?? props.product.variants.find(v => v.imageUrl)?.imageUrl
  ?? null,
)

type Variant = ProductDetail['variants'][number]

const columns: TableColumn<Variant>[] = [
  { id: 'variant', header: 'Variante' },
  { accessorKey: 'sku', header: 'SKU' },
  { id: 'price', header: 'Precio', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'availableStock', header: 'Stock', meta: { class: { th: 'text-right', td: 'text-right' } } },
]
</script>

<template>
  <div class="grid gap-6">
    <UCard>
      <div class="grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div class="aspect-[4/5] w-32 overflow-hidden rounded-lg border border-default bg-muted">
          <img
            v-if="primaryImage"
            :src="primaryImage"
            :alt="product.name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="grid size-full place-items-center text-muted"
          >
            <UIcon
              name="ph:image"
              class="size-6"
              aria-hidden="true"
            />
          </div>
        </div>

        <div class="grid content-start gap-4">
          <p class="flex items-center gap-2 text-sm font-medium text-primary">
            <UIcon
              name="ph:check-circle-fill"
              class="size-5"
              aria-hidden="true"
            />
            Artículo creado
          </p>
          <h2
            ref="heading"
            tabindex="-1"
            class="text-2xl font-semibold tracking-tight text-highlighted outline-none"
          >
            {{ product.name }}
          </h2>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Estado
              </dt>
              <dd class="text-highlighted">
                {{ STATUS_LABELS[product.status] }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Categoría
              </dt>
              <dd class="text-highlighted">
                {{ product.category.name }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Precio base
              </dt>
              <dd class="tabular-nums text-highlighted">
                {{ formatMoney(product.basePrice) }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Impuesto
              </dt>
              <dd class="text-highlighted">
                {{ product.taxName ?? 'IVA global' }}
              </dd>
            </div>
          </dl>
          <p class="font-mono text-sm text-muted">
            /{{ product.slug }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard
      v-if="variants.length"
      :title="`${variants.length} ${variants.length === 1 ? 'variante' : 'variantes'}`"
    >
      <UTable
        :data="variants"
        :columns="columns"
        class="-mx-4 sm:-mx-6"
      >
        <template #variant-cell="{ row }">
          <span class="flex items-center gap-2.5 text-highlighted">
            <ColorSwatch
              :hex="row.original.color.hex"
              size="sm"
            />
            {{ row.original.color.name }} {{ row.original.size.name }}
          </span>
        </template>
        <template #sku-cell="{ row }">
          <span class="font-mono text-highlighted">{{ row.original.sku }}</span>
        </template>
        <template #price-cell="{ row }">
          <span class="tabular-nums text-highlighted">{{ formatMoney(product.basePrice + row.original.priceAdjustment) }}</span>
        </template>
        <template #availableStock-cell="{ row }">
          <span class="tabular-nums text-highlighted">{{ row.original.availableStock }}</span>
        </template>
      </UTable>
    </UCard>

    <div class="flex flex-wrap gap-2">
      <UButton
        icon="ph:plus"
        label="Crear otro artículo"
        @click="emit('createAnother')"
      />
    </div>
  </div>
</template>
