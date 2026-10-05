<script setup lang="ts">
import { useProductEditStore } from '../stores/product-edit.store'
import ProductImageGallery from './ProductImageGallery.vue'

const store = useProductEditStore()
const product = computed(() => store.product!)

const byPosition = (colorId: string | null) => product.value.images
  .filter(i => i.colorId === colorId)
  .sort((a, b) => a.position - b.position)

/** Colores con variantes, mas los que conservan fotos aunque ya no tengan variantes. */
const colorGalleries = computed(() => {
  const galleries = new Map<string, { id: string, name: string, hex: string, canUpload: boolean }>()
  for (const { color } of product.value.variants) {
    galleries.set(color.id, { id: color.id, name: color.name, hex: color.hex, canUpload: true })
  }
  for (const image of product.value.images) {
    if (image.colorId && !galleries.has(image.colorId)) {
      galleries.set(image.colorId, { id: image.colorId, name: image.colorName ?? 'Color', hex: image.colorHex ?? 'transparent', canUpload: false })
    }
  }
  return [...galleries.values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map(gallery => ({ ...gallery, images: byPosition(gallery.id) }))
})
const generalImages = computed(() => byPosition(null))
</script>

<template>
  <UCard
    title="Imágenes"
    description="Los cambios se guardan al momento. La foto principal de cada galería es la que se muestra primero."
  >
    <div class="grid gap-8">
      <UAlert
        color="primary"
        icon="ph:info"
        title="Cada variante muestra su foto propia. Si no tiene, usa la principal de su color y, si tampoco hay, la principal de la galería general."
      />

      <div class="grid gap-3">
        <div class="grid gap-1">
          <h3 class="text-sm font-semibold text-highlighted">
            Fotos por color
          </h3>
          <p class="text-sm text-muted">
            Todas las tallas de un color comparten estas fotos.
          </p>
        </div>
        <p
          v-if="!colorGalleries.length"
          class="text-sm text-muted"
        >
          Agrega variantes para subir fotos por color.
        </p>
        <div
          v-else
          class="grid gap-8"
        >
          <ProductImageGallery
            v-for="gallery in colorGalleries"
            :key="gallery.id"
            :color-id="gallery.id"
            :name="gallery.name"
            :hex="gallery.hex"
            :images="gallery.images"
            :can-upload="gallery.canUpload"
          />
        </div>
      </div>

      <div class="grid gap-3 border-t border-default pt-6">
        <div class="grid gap-1">
          <h3 class="text-sm font-semibold text-highlighted">
            Galería general
          </h3>
          <p class="text-sm text-muted">
            Fotos que no dependen del color: detalle de la tela, guía de tallas, fotos de ambiente.
          </p>
        </div>
        <ProductImageGallery
          :color-id="null"
          name="Galería general"
          :images="generalImages"
          can-upload
        />
      </div>
    </div>
  </UCard>
</template>
