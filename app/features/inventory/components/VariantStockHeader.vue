<script setup lang="ts">
import { ColorSwatch } from '~/features/catalog'
import { STATUS_LABELS } from '~/features/products'
import type { VariantStock } from '../types'
import StockLevels from './StockLevels.vue'
import StockStatusBadge from './StockStatusBadge.vue'

defineProps<{ variant: VariantStock }>()
</script>

<template>
  <UiPanel>
    <div class="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
      <div class="aspect-[4/5] w-28 overflow-hidden rounded-xl border border-line bg-surface">
        <img
          v-if="variant.imageUrl"
          :src="variant.imageUrl"
          :alt="variant.productName"
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

      <div class="grid content-start gap-5">
        <div class="grid gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <StockStatusBadge
              :available-stock="variant.availableStock"
              :low-stock="variant.lowStock"
            />
            <span class="inline-flex rounded-lg bg-surface px-2 py-1 text-xs font-medium text-ink-muted">
              {{ STATUS_LABELS[variant.productStatus] }}
            </span>
            <span
              v-if="!variant.active"
              class="inline-flex rounded-lg bg-surface px-2 py-1 text-xs font-medium text-ink-muted"
            >Variante inactiva</span>
          </div>
          <p class="font-mono text-sm text-ink-muted">
            {{ variant.sku }}
          </p>
          <dl class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <div class="flex items-center gap-1.5">
              <dt class="sr-only">
                Color
              </dt>
              <ColorSwatch
                :hex="variant.colorHex"
                size="sm"
              />
              <dd class="text-ink">
                {{ variant.colorName }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-ink-muted">
                Talla
              </dt>
              <dd class="font-medium text-ink">
                {{ variant.sizeName }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-ink-muted">
                Precio
              </dt>
              <dd class="tabular-nums text-ink">
                {{ formatMoney(variant.finalPrice) }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-ink-muted">
                Costo
              </dt>
              <dd class="tabular-nums text-ink">
                {{ formatMoney(variant.costPrice) }}
              </dd>
            </div>
          </dl>
        </div>

        <StockLevels :levels="variant" />

        <div
          v-if="$slots.actions"
          class="flex flex-wrap gap-2"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </UiPanel>
</template>
