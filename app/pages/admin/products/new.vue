<script setup lang="ts">
import { ProductCreateForm } from '~/features/products'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Nuevo artículo | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Nuevo artículo"
      description="Datos, variantes y fotos se guardan en un solo envío. Si sales a crear una talla o un color, el borrador te espera aquí."
    />
    <ProductCreateForm />
  </div>
</template>
