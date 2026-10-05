<script setup lang="ts">
import { ColorSwatch } from '~/features/catalog'
import { STATUS_LABELS } from '~/features/products'
import type { VariantStock } from '../types'
import StockLevels from './StockLevels.vue'
import StockStatusBadge from './StockStatusBadge.vue'

defineProps<{ variant: VariantStock }>()
</script>

<template>
  <UCard>
    <div class="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
      <div class="aspect-[4/5] w-28 overflow-hidden rounded-lg border border-default bg-muted">
        <img
          v-if="variant.imageUrl"
          :src="variant.imageUrl"
          :alt="variant.productName"
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

      <div class="grid content-start gap-5">
        <div class="grid gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <StockStatusBadge
              :available-stock="variant.availableStock"
              :low-stock="variant.lowStock"
            />
            <UBadge
              color="neutral"
              :label="STATUS_LABELS[variant.productStatus]"
            />
            <UBadge
              v-if="!variant.active"
              color="neutral"
              label="Variante inactiva"
            />
          </div>
          <p class="font-mono text-sm text-muted">
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
              <dd class="text-highlighted">
                {{ variant.colorName }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-muted">
                Talla
              </dt>
              <dd class="font-medium text-highlighted">
                {{ variant.sizeName }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-muted">
                Precio
              </dt>
              <dd class="tabular-nums text-highlighted">
                {{ formatMoney(variant.finalPrice) }}
              </dd>
            </div>
            <div class="flex items-center gap-1.5">
              <dt class="text-muted">
                Costo
              </dt>
              <dd class="tabular-nums text-highlighted">
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
  </UCard>
</template>
