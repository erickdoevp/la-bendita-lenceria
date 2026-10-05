<script setup lang="ts">
import { SizesManager } from '~/features/catalog'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Tallas | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Tallas"
      description="Catálogo global de tallas. Se combinan con los colores para formar las variantes."
    />
    <SizesManager />
  </div>
</template>
