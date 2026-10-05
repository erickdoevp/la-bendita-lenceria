<script setup lang="ts">
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const confirmingDiscard = ref(false)

const stock = computed(() => draft.variants.reduce((sum, v) => sum + toNumber(v.initialStock), 0))
const allFiles = computed(() => [
  ...draft.generalImages,
  ...draft.variantColorIds.flatMap(id => draft.colorImages[id] ?? []),
  ...draft.variants.map(v => v.image),
])
const photoCount = computed(() => allFiles.value.filter(Boolean).length)
const bytes = computed(() => totalBytes(allFiles.value))
const overLimit = computed(() => bytes.value > MAX_REQUEST_BYTES)

function discard() {
  draft.reset()
  confirmingDiscard.value = false
}
</script>

<template>
  <div class="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-default bg-default/95 p-3 pl-5 shadow-[0_12px_40px_-12px_rgb(24_24_27/0.25)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-muted">
      <span class="tabular-nums text-highlighted">{{ draft.variants.length }}</span> variantes,
      <span class="tabular-nums text-highlighted">{{ stock }}</span> piezas,
      <span
        class="tabular-nums"
        :class="overLimit ? 'text-error' : 'text-highlighted'"
      >{{ photoCount }} fotos ({{ formatBytes(bytes) }} de 100 MB)</span>
    </p>

    <div class="flex items-center justify-end gap-2">
      <template v-if="confirmingDiscard">
        <span class="text-sm text-muted">¿Descartar todo?</span>
        <UButton
          color="error"
          variant="soft"
          size="sm"
          label="Sí, descartar"
          @click="discard"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          label="No"
          @click="confirmingDiscard = false"
        />
      </template>
      <template v-else>
        <UButton
          v-if="draft.isDirty"
          color="neutral"
          variant="ghost"
          :disabled="draft.submitting"
          label="Descartar"
          @click="confirmingDiscard = true"
        />
        <UButton
          type="submit"
          icon="ph:check"
          :loading="draft.submitting"
          :label="draft.submitting ? 'Creando artículo' : 'Crear artículo'"
        />
      </template>
    </div>
  </div>
</template>
