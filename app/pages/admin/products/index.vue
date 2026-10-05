<script setup lang="ts">
import { PRODUCT_ROUTES, ProductsManager } from '~/features/products'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Artículos | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Artículos"
      description="Todo el catálogo, incluidos borradores y archivados que no se ven en la tienda."
    >
      <template #links>
        <UButton
          icon="ph:plus"
          :to="PRODUCT_ROUTES.create"
          label="Nuevo artículo"
        />
      </template>
    </UPageHeader>
    <ProductsManager />
  </div>
</template>
