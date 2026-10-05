<script setup lang="ts">
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const values = reactive({ priceAdjustment: '' as number | string, costPrice: '' as number | string, initialStock: '' as number | string })
const message = ref<string | null>(null)

// Solo se aplican los campos con valor
const filled = computed(() => Object.fromEntries(
  Object.entries(values).filter(([, v]) => v !== '' && Number.isFinite(Number(v))).map(([k, v]) => [k, Number(v)]),
))

function apply() {
  const count = Object.keys(filled.value).length
  if (!count) return
  draft.applyToAll(filled.value)
  message.value = `Aplicado a ${draft.variants.length} variantes.`
  Object.assign(values, { priceAdjustment: '', costPrice: '', initialStock: '' })
}

watch(values, () => {
  message.value = null
})
</script>

<template>
  <div class="grid gap-3 rounded-lg bg-muted p-4">
    <p class="text-sm font-medium text-highlighted">
      Rellenar todas las variantes
    </p>
    <div class="grid grid-cols-2 items-end gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
      <UFormField
        label="Ajuste"
        :ui="{ label: 'text-xs font-normal text-muted' }"
      >
        <UInput
          v-model.number="values.priceAdjustment"
          type="number"
          step="0.01"
        >
          <template #leading>
            <span class="text-muted">$</span>
          </template>
        </UInput>
      </UFormField>
      <UFormField
        label="Costo"
        :ui="{ label: 'text-xs font-normal text-muted' }"
      >
        <UInput
          v-model.number="values.costPrice"
          type="number"
          min="0"
          step="0.01"
        >
          <template #leading>
            <span class="text-muted">$</span>
          </template>
        </UInput>
      </UFormField>
      <UFormField
        label="Stock inicial"
        :ui="{ label: 'text-xs font-normal text-muted' }"
      >
        <UInput
          v-model.number="values.initialStock"
          type="number"
          min="0"
          step="1"
        />
      </UFormField>
      <UButton
        color="neutral"
        variant="outline"
        :disabled="!Object.keys(filled).length"
        label="Aplicar"
        @click="apply"
      />
    </div>
    <p
      v-if="message"
      role="status"
      class="text-sm text-muted"
    >
      {{ message }}
    </p>
  </div>
</template>
