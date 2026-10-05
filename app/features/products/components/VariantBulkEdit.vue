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
  <div class="grid gap-3 rounded-xl bg-surface p-4">
    <p class="text-sm font-medium text-ink">
      Rellenar todas las variantes
    </p>
    <div class="grid grid-cols-2 items-end gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
      <div class="grid gap-1">
        <label
          for="bulk-adjustment"
          class="text-xs text-ink-muted"
        >Ajuste</label>
        <UiInput
          id="bulk-adjustment"
          v-model="values.priceAdjustment"
          size="sm"
          type="number"
          step="0.01"
          prefix="$"
        />
      </div>
      <div class="grid gap-1">
        <label
          for="bulk-cost"
          class="text-xs text-ink-muted"
        >Costo</label>
        <UiInput
          id="bulk-cost"
          v-model="values.costPrice"
          size="sm"
          type="number"
          min="0"
          step="0.01"
          prefix="$"
        />
      </div>
      <div class="grid gap-1">
        <label
          for="bulk-stock"
          class="text-xs text-ink-muted"
        >Stock inicial</label>
        <UiInput
          id="bulk-stock"
          v-model="values.initialStock"
          size="sm"
          type="number"
          min="0"
          step="1"
        />
      </div>
      <UiButton
        variant="secondary"
        size="sm"
        class="h-10"
        :disabled="!Object.keys(filled).length"
        @click="apply"
      >
        Aplicar
      </UiButton>
    </div>
    <p
      v-if="message"
      role="status"
      class="text-[13px] text-ink-muted"
    >
      {{ message }}
    </p>
  </div>
</template>
