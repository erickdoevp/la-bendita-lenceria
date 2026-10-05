<script setup lang="ts">
import { CollectionDetail } from '~/features/collections'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Colección | Panel La Bendita',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre colecciones se reinicia el estado del detalle
const collectionId = computed(() => String(route.params.collectionId))
</script>

<template>
  <CollectionDetail
    :key="collectionId"
    :collection-id="collectionId"
    :created="route.query.created === '1'"
  />
</template>
