<script setup lang="ts">
import { VariantInventoryDetail } from '~/features/inventory'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Inventario de variante | Panel La Bendita',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre variantes se reinicia el estado del detalle
const variantId = computed(() => String(route.params.variantId))
</script>

<template>
  <VariantInventoryDetail
    :key="variantId"
    :variant-id="variantId"
  />
</template>
