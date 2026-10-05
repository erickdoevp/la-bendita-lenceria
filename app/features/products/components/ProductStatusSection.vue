<script setup lang="ts">
import { CREATE_STATUS_OPTIONS } from '../constants'
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
</script>

<template>
  <UCard title="Publicación">
    <URadioGroup
      v-model="draft.form.status"
      legend="Estado del artículo"
      :items="CREATE_STATUS_OPTIONS"
      variant="card"
      :ui="{ legend: 'sr-only', fieldset: 'grid gap-3 sm:grid-cols-2' }"
    />
  </UCard>
</template>
