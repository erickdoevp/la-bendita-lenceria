<script setup lang="ts">
import { ReviewsModeration } from '~/features/reviews'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Reseñas | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Reseñas"
      description="Toda reseña nace oculta y se publica cuando la apruebas. Si la clienta la edita, vuelve a revisión. Rechazar la borra."
    />
    <ReviewsModeration />
  </div>
</template>
