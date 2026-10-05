<script setup lang="ts">
import { CREATE_STATUS_OPTIONS, EDIT_STATUS_OPTIONS } from '../constants'
import { useProductForm } from '../composables/useProductForm'

const product = useProductForm()
const options = computed(() => (product.mode === 'create' ? CREATE_STATUS_OPTIONS : EDIT_STATUS_OPTIONS))
</script>

<template>
  <UCard title="Publicación">
    <URadioGroup
      v-model="product.form.status"
      legend="Estado del artículo"
      :items="options"
      variant="card"
      :ui="{ legend: 'sr-only', fieldset: options.length > 2 ? 'grid gap-3 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-2' }"
    />
    <p
      v-if="product.fieldErrors.status"
      class="mt-3 text-sm text-error"
    >
      {{ product.fieldErrors.status }}
    </p>
  </UCard>
</template>
