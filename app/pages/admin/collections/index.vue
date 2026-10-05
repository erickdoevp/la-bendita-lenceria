<script setup lang="ts">
import { COLLECTION_ROUTES, CollectionsManager } from '~/features/collections'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Colecciones | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Colecciones"
      description="Selecciones de artículos para el escaparate. Son independientes de las categorías: un artículo puede estar en varias."
    >
      <template #actions>
        <UiButton
          icon="ph:plus"
          :to="COLLECTION_ROUTES.create"
        >
          Nueva colección
        </UiButton>
      </template>
    </UiPageHeader>
    <CollectionsManager />
  </div>
</template>
