<script setup lang="ts">
import type { StoreCategory } from '~/features/store-catalog'
import { categoryTrailPath, ProductRail, StoreBreadcrumbs } from '~/features/store-catalog'
import { useAddToBag } from '../composables/useAddToBag'
import { useRelatedProducts } from '../composables/useProductDetail'
import { useVariantSelection } from '../composables/useVariantSelection'
import type { StoreProductDetail } from '../types'
import ProductDetails from './ProductDetails.vue'
import ProductGallery from './ProductGallery.vue'
import ProductPurchasePanel from './ProductPurchasePanel.vue'
import ProductReviews from './ProductReviews.vue'
import ProductSizeGuide from './ProductSizeGuide.vue'
import ProductStickyBar from './ProductStickyBar.vue'

const props = defineProps<{
  product: StoreProductDetail
  /** [raiz, ..., categoria del producto]; vacio si la categoria ya no existe. */
  trail: StoreCategory[]
}>()

const product = toRef(props, 'product')
const selection = useVariantSelection(product)
const bag = useAddToBag()
const { products: related, loading: relatedLoading } = useRelatedProducts(computed(() => props.product.id))

const quantity = ref(1)
const sizeError = ref<string | null>(null)
const guideOpen = ref(false)

const breadcrumbs = computed(() => [
  ...props.trail.map((node, index) => ({ label: node.name, to: categoryTrailPath(props.trail.slice(0, index + 1)) })),
  { label: props.product.name },
])

watch(selection.size, (value) => {
  if (value) sizeError.value = null
})

// Cambiar de producto (desde relacionados) reinicia cantidad y avisos
watch(() => props.product.id, () => {
  quantity.value = 1
  sizeError.value = null
})

const purchase = useTemplateRef<HTMLElement>('purchase')

function submit() {
  const variant = selection.variant.value
  if (!variant) {
    sizeError.value = 'Elige tu talla para continuar.'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    purchase.value?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    return
  }
  if (variant.stock <= 0) return
  bag.add(variant, quantity.value)
}

// La barra fija aparece cuando el panel de compra ya quedo arriba, fuera de la pantalla
const showStickyBar = ref(false)
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!purchase.value) return
  observer = new IntersectionObserver(([entry]) => {
    showStickyBar.value = Boolean(entry && !entry.isIntersecting && entry.boundingClientRect.top < 0)
  })
  observer.observe(purchase.value)
})
onBeforeUnmount(() => observer?.disconnect())

const soldOut = computed(() => Boolean(selection.variant.value && selection.variant.value.stock <= 0))
</script>

<template>
  <div class="pb-24 lg:pb-0">
    <div class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      <StoreBreadcrumbs :items="breadcrumbs" />
    </div>

    <div class="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:px-10">
      <div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <ProductGallery
          :images="selection.images.value"
          :product-name="product.name"
        />
      </div>

      <div class="grid min-w-0 content-start gap-10">
        <div
          ref="purchase"
          class="scroll-mt-24"
        >
          <ProductPurchasePanel
            v-model:quantity="quantity"
            :product="product"
            :selection="selection"
            :category-label="trail.at(-1)?.name ?? null"
            :bag-state="bag.state.value"
            :bag-error="bag.error.value"
            :size-error="sizeError"
            @submit="submit"
            @open-guide="guideOpen = true"
          />
        </div>
        <ProductDetails :product="product" />
      </div>
    </div>

    <div class="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:mt-28 lg:px-10">
      <ProductReviews
        :product-id="product.id"
        :slug="product.slug"
        :rating="product.rating"
      />
    </div>

    <ProductRail
      v-if="relatedLoading || related?.length"
      class="py-20 lg:py-28"
      title="También te puede gustar"
      title-id="product-related-title"
      :products="related ?? null"
      :loading="relatedLoading"
    />

    <ProductSizeGuide
      v-model:open="guideOpen"
      :system="product.sizeSystem"
    />

    <ProductStickyBar
      :visible="showStickyBar"
      :name="product.name"
      :price="selection.price.value"
      :image-url="selection.images.value[0]?.url ?? null"
      :size="selection.size.value"
      :sold-out="soldOut"
      :bag-state="bag.state.value"
      @submit="submit"
    />
  </div>
</template>
