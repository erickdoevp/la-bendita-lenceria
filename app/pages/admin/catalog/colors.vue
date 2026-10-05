<script setup lang="ts">
import { ColorsManager } from '~/features/catalog'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Colores | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Colores"
      description="Catálogo global de colores con su muestra para la tienda."
    />
    <ColorsManager />
  </div>
</template>
