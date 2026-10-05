<script setup lang="ts">
import { ColorSwatch, useColorsStore, useSizesStore } from '~/features/catalog'
import { useSkuPreviews } from '../composables/useSkuPreviews'
import { useProductDraftStore } from '../stores/product-draft.store'
import ProductColorPicker from './ProductColorPicker.vue'
import ProductSizePicker from './ProductSizePicker.vue'
import VariantBulkEdit from './VariantBulkEdit.vue'
import VariantRow from './VariantRow.vue'

const draft = useProductDraftStore()
const sizes = useSizesStore()
const colors = useColorsStore()
useSkuPreviews()

const sizeNames = computed(() => new Map(sizes.items.map(s => [s.id, s.name])))

/** Variantes agrupadas por color, conservando su indice real en draft.variants. */
const groups = computed(() => draft.colorIds.map((colorId) => {
  const color = colors.byId.get(colorId)
  return {
    colorId,
    name: color?.name ?? 'Color',
    hex: color?.hex ?? 'transparent',
    rows: draft.variants
      .map((variant, index) => ({ variant, index }))
      .filter(({ variant }) => variant.colorId === colorId),
  }
}))

const hint = computed(() => {
  if (!draft.sizeIds.length && !draft.colorIds.length) return 'Elige tallas y colores: se crea una variante por cada combinación.'
  if (!draft.sizeIds.length) return 'Ahora elige al menos una talla.'
  if (!draft.colorIds.length) return 'Ahora elige al menos un color.'
  return null
})
</script>

<template>
  <UiPanel
    title="Variantes"
    description="Cada combinación de talla y color tiene su propio SKU, costo y stock. Es lo que se agrega al carrito."
  >
    <div
      id="product-variants"
      class="grid gap-6"
    >
      <div class="grid gap-6 md:grid-cols-2">
        <ProductSizePicker />
        <ProductColorPicker />
      </div>

      <UiAlert v-if="draft.fieldErrors.variants">
        {{ draft.fieldErrors.variants }}
      </UiAlert>

      <p
        v-if="hint"
        class="text-sm text-ink-muted"
      >
        {{ hint }}
      </p>

      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p class="text-sm text-ink">
            <span class="font-semibold tabular-nums">{{ draft.variants.length }}</span>
            {{ draft.variants.length === 1 ? 'variante' : 'variantes' }}
          </p>
          <UiButton
            v-if="draft.excludedKeys.length"
            variant="ghost"
            size="sm"
            icon="ph:arrow-counter-clockwise"
            @click="draft.restoreVariants()"
          >
            Restaurar {{ draft.excludedKeys.length }} {{ draft.excludedKeys.length === 1 ? 'quitada' : 'quitadas' }}
          </UiButton>
        </div>

        <VariantBulkEdit v-if="draft.variants.length > 1" />

        <div class="@container grid gap-6">
          <div
            class="hidden grid-cols-[3.5rem_minmax(8rem,1.3fr)_repeat(3,minmax(0,1fr))_5.5rem_7rem] gap-2.5 text-xs font-medium text-ink-muted @min-[42rem]:grid"
            aria-hidden="true"
          >
            <span>Talla</span>
            <span>SKU</span>
            <span>Ajuste</span>
            <span>Costo</span>
            <span>Stock inicial</span>
            <span class="text-right">Precio final</span>
            <span class="text-right">Foto propia</span>
          </div>

          <section
            v-for="group in groups"
            :key="group.colorId"
            :aria-label="`Variantes en ${group.name}`"
          >
            <h3 class="flex items-center gap-2.5 text-sm font-semibold text-ink">
              <ColorSwatch
                :hex="group.hex"
                size="sm"
              />
              {{ group.name }}
              <span class="font-normal text-ink-muted">{{ group.rows.length }}</span>
            </h3>
            <p
              v-if="!group.rows.length"
              class="mt-2 text-sm text-ink-muted"
            >
              Quitaste todas las tallas de este color.
            </p>
            <ul
              v-else
              class="mt-1 divide-y divide-line"
            >
              <VariantRow
                v-for="row in group.rows"
                :key="row.variant.key"
                :index="row.index"
                :size-name="sizeNames.get(row.variant.sizeId) ?? 'Talla'"
                :color-name="group.name"
              />
            </ul>
          </section>
        </div>
      </template>
    </div>
  </UiPanel>
</template>
