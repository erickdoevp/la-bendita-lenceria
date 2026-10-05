<script setup lang="ts">
import { useColorsStore } from '~/features/catalog'
import { useProductDraftStore } from '../stores/product-draft.store'
import ProductColorGallery from './ProductColorGallery.vue'

const draft = useProductDraftStore()
const colors = useColorsStore()

const colorGalleries = computed(() => draft.variantColorIds.map((id) => {
  const color = colors.byId.get(id)
  return { id, name: color?.name ?? 'Color', hex: color?.hex ?? 'transparent' }
}))
</script>

<template>
  <UiPanel
    title="Imágenes"
    description="La primera foto de cada galería es la principal. Puedes cambiarla después de subirlas."
  >
    <div class="grid gap-8">
      <UiAlert tone="info">
        Cada variante muestra su foto propia. Si no tiene, usa la principal de su color y, si tampoco hay, la principal de la galería general.
      </UiAlert>

      <div class="grid gap-3">
        <div class="grid gap-1">
          <h3 class="text-sm font-semibold text-ink">
            Fotos por color
          </h3>
          <p class="text-sm text-ink-muted">
            Lo normal: todas las tallas de un color comparten estas fotos.
          </p>
        </div>
        <p
          v-if="!colorGalleries.length"
          class="text-sm text-ink-muted"
        >
          Elige colores en Variantes para subir sus fotos.
        </p>
        <div
          v-else
          class="grid gap-6"
        >
          <ProductColorGallery
            v-for="color in colorGalleries"
            :key="color.id"
            :color-id="color.id"
            :name="color.name"
            :hex="color.hex"
          />
        </div>
      </div>

      <div class="grid gap-3 border-t border-line pt-6">
        <div class="grid gap-1">
          <h3 class="text-sm font-semibold text-ink">
            Galería general
          </h3>
          <p class="text-sm text-ink-muted">
            Fotos que no dependen del color: detalle de la tela, guía de tallas, fotos de ambiente.
          </p>
        </div>
        <UiImagePicker
          id="general-gallery"
          v-model="draft.generalImages"
          multiple
          :error="draft.fieldErrors.images"
        />
      </div>
    </div>
  </UiPanel>
</template>
