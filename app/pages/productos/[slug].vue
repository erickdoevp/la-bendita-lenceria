<script setup lang="ts">
import { findCategoryTrail, STORE_ROUTES, useStoreCategories } from '~/features/store-catalog'
import { ProductDetailView, useProductDetail } from '~/features/store-product'

// Al abrir otro producto (p. ej. desde relacionados) se sube al inicio;
// cambiar color o talla solo toca la query y conserva la posicion
definePageMeta({
  scrollToTop: (to, from) => to.path !== from.path,
})

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug))

const categories = await useStoreCategories()
const { product } = await useProductDetail(slug)

if (!product.value) {
  throw createError({ statusCode: 404, message: 'No encontramos este producto.', fatal: true })
}

// Navegando entre relacionados hacia un slug que no existe
watch(product, (value) => {
  if (value === null) showError({ statusCode: 404, message: 'No encontramos este producto.' })
})

const trail = computed(() => (product.value ? findCategoryTrail(categories.tree, product.value.categoryId) ?? [] : []))

const description = computed(() => product.value?.description[0] ?? '')
const image = computed(() => product.value?.images[0]?.url)

useSeoMeta({
  title: () => (product.value ? `${product.value.name} | La Bendita` : 'La Bendita'),
  description,
  ogTitle: () => product.value?.name,
  ogDescription: description,
  ogImage: image,
  ogType: 'website',
})

// Datos estructurados para que los buscadores muestren precio, stock y calificacion
useHead(() => {
  const p = product.value
  if (!p) return {}
  const url = `${config.public.siteUrl}${STORE_ROUTES.product(p.slug)}`
  const inStock = p.variants.some(v => v.stock > 0)
  return {
    link: [{ rel: 'canonical', href: url }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': p.name,
        'description': p.description.join(' '),
        'image': p.images.map(img => img.url),
        'sku': p.variants[0]?.sku,
        'brand': { '@type': 'Brand', 'name': 'La Bendita' },
        'offers': {
          '@type': 'Offer',
          'url': url,
          'priceCurrency': 'MXN',
          'price': p.price,
          'availability': `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
        },
        ...(p.rating
          ? { aggregateRating: { '@type': 'AggregateRating', 'ratingValue': p.rating.average.toFixed(1), 'reviewCount': p.rating.count } }
          : {}),
      }),
    }],
  }
})
</script>

<template>
  <ProductDetailView
    v-if="product"
    :product="product"
    :trail="trail"
  />
</template>
