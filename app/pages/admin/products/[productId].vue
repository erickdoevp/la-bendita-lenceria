<script setup lang="ts">
import { ProductEditor } from '~/features/products'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Artículo | Panel La Bendita',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre articulos se reinicia el estado del detalle
const productId = computed(() => String(route.params.productId))
</script>

<template>
  <ProductEditor
    :key="productId"
    :product-id="productId"
  />
</template>
