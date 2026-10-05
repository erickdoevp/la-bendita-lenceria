<script setup lang="ts">
import { CategoriesManager } from '~/features/catalog'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Categorías | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Categorías"
      description="Organizan la tienda. Todo artículo pertenece a una categoría o subcategoría."
    />
    <CategoriesManager />
  </div>
</template>
