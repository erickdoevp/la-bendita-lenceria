<script setup lang="ts">
import { MyReviewsManager } from '~/features/customer-reviews'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Mis reseñas | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <MyReviewsManager />
</template>
