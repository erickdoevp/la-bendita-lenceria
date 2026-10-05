<script setup lang="ts">
import { COLLECTION_ROUTES, CollectionForm } from '~/features/collections'
import type { Collection } from '~/features/collections'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Nueva colección | Panel La Bendita',
  robots: 'noindex, nofollow',
})

function onSaved(collection: Collection) {
  navigateTo({ path: COLLECTION_ROUTES.detail(collection.id), query: { created: '1' } }, { replace: true })
}
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Nueva colección"
      description="Se crea vacía y queda al final de la tienda. Después eliges sus artículos."
    />
    <UCard
      class="max-w-2xl"
    >
      <CollectionForm
        @saved="onSaved"
        @cancel="navigateTo(COLLECTION_ROUTES.list)"
      />
    </UCard>
  </div>
</template>
