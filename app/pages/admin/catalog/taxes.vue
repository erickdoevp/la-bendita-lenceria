<script setup lang="ts">
import { TaxesManager } from '~/features/catalog'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Impuestos | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Impuestos"
      description="Solo un IVA puede estar activo como global a la vez."
    />
    <TaxesManager />
  </div>
</template>
