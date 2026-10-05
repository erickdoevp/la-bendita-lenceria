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
    <UiPageHeader
      title="Artículos"
      description="Todo el catálogo, incluidos borradores y archivados que no se ven en la tienda."
    >
      <template #actions>
        <UiButton
          icon="ph:plus"
          :to="PRODUCT_ROUTES.create"
        >
          Nuevo artículo
        </UiButton>
      </template>
    </UiPageHeader>
    <ProductsManager />
  </div>
</template>
