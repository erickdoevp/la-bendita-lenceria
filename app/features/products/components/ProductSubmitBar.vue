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
  <div class="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-line bg-surface-raised/95 p-3 pl-5 shadow-[0_12px_40px_-12px_rgb(24_24_27/0.25)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-ink-muted">
      <span class="tabular-nums text-ink">{{ draft.variants.length }}</span> variantes,
      <span class="tabular-nums text-ink">{{ stock }}</span> piezas,
      <span
        class="tabular-nums"
        :class="overLimit ? 'text-danger' : 'text-ink'"
      >{{ photoCount }} fotos ({{ formatBytes(bytes) }} de 100 MB)</span>
    </p>

    <div class="flex items-center justify-end gap-2">
      <template v-if="confirmingDiscard">
        <span class="text-sm text-ink-muted">¿Descartar todo?</span>
        <UiButton
          variant="danger"
          size="sm"
          @click="discard"
        >
          Sí, descartar
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          @click="confirmingDiscard = false"
        >
          No
        </UiButton>
      </template>
      <template v-else>
        <UiButton
          v-if="draft.isDirty"
          variant="ghost"
          :disabled="draft.submitting"
          @click="confirmingDiscard = true"
        >
          Descartar
        </UiButton>
        <UiButton
          type="submit"
          icon="ph:check"
          :loading="draft.submitting"
        >
          {{ draft.submitting ? 'Creando artículo' : 'Crear artículo' }}
        </UiButton>
      </template>
    </div>
  </div>
</template>
