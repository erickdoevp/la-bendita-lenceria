<script setup lang="ts">
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
</script>

<template>
  <div class="grid gap-6">
    <UiPanel>
      <div class="grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div class="aspect-[4/5] w-32 overflow-hidden rounded-xl border border-line bg-surface">
          <img
            v-if="primaryImage"
            :src="primaryImage"
            :alt="product.name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="grid size-full place-items-center text-ink-muted"
          >
            <Icon
              name="ph:image"
              class="size-6"
              aria-hidden="true"
            />
          </div>
        </div>

        <div class="grid content-start gap-4">
          <p class="flex items-center gap-2 text-sm font-medium text-accent">
            <Icon
              name="ph:check-circle-fill"
              class="size-5"
              aria-hidden="true"
            />
            Artículo creado
          </p>
          <h2
            ref="heading"
            tabindex="-1"
            class="text-2xl font-semibold tracking-tight text-ink outline-none"
          >
            {{ product.name }}
          </h2>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div class="grid gap-0.5">
              <dt class="text-ink-muted">
                Estado
              </dt>
              <dd class="text-ink">
                {{ STATUS_LABELS[product.status] }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-ink-muted">
                Categoría
              </dt>
              <dd class="text-ink">
                {{ product.category.name }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-ink-muted">
                Precio base
              </dt>
              <dd class="tabular-nums text-ink">
                {{ formatMoney(product.basePrice) }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-ink-muted">
                Impuesto
              </dt>
              <dd class="text-ink">
                {{ product.taxName ?? 'IVA global' }}
              </dd>
            </div>
          </dl>
          <p class="font-mono text-[13px] text-ink-muted">
            /{{ product.slug }}
          </p>
        </div>
      </div>
    </UiPanel>

    <UiPanel
      v-if="variants.length"
      :title="`${variants.length} ${variants.length === 1 ? 'variante' : 'variantes'}`"
    >
      <div class="-mx-5 overflow-x-auto sm:-mx-6">
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Variante
              </th>
              <th class="pb-3 font-medium">
                SKU
              </th>
              <th class="pb-3 text-right font-medium">
                Precio
              </th>
              <th class="px-5 pb-3 text-right font-medium sm:px-6">
                Stock
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line border-t border-line">
            <tr
              v-for="variant in variants"
              :key="variant.id"
            >
              <td class="px-5 py-3 sm:px-6">
                <span class="flex items-center gap-2.5 text-ink">
                  <ColorSwatch
                    :hex="variant.color.hex"
                    size="sm"
                  />
                  {{ variant.color.name }} {{ variant.size.name }}
                </span>
              </td>
              <td class="whitespace-nowrap py-3 font-mono text-[13px] text-ink">
                {{ variant.sku }}
              </td>
              <td class="py-3 text-right tabular-nums text-ink">
                {{ formatMoney(product.basePrice + variant.priceAdjustment) }}
              </td>
              <td class="px-5 py-3 text-right tabular-nums text-ink sm:px-6">
                {{ variant.availableStock }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiPanel>

    <div class="flex flex-wrap gap-2">
      <UiButton
        icon="ph:plus"
        @click="emit('createAnother')"
      >
        Crear otro artículo
      </UiButton>
    </div>
  </div>
</template>
