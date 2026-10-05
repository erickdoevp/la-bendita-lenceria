<script setup lang="ts">
import type { Size } from '~/features/catalog'
import { SizeForm, useSizesStore } from '~/features/catalog'
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const sizes = useSizesStore()
const modal = ref(false)

function onCreated(size: Size) {
  modal.value = false
  draft.toggleSize(size.id)
}
</script>

<template>
  <fieldset class="grid gap-3">
    <legend class="mb-3 text-sm font-medium text-ink">
      Tallas
    </legend>

    <div
      v-if="sizes.status === 'pending'"
      class="flex flex-wrap gap-2"
    >
      <UiSkeleton
        v-for="n in 5"
        :key="n"
        class="h-9 w-14 rounded-full"
      />
    </div>

    <UiEmptyState
      v-else-if="sizes.status === 'ready' && !sizes.items.length"
      icon="ph:ruler"
      title="Aún no hay tallas"
      description="Las tallas son un catálogo global. Crea las que manejas."
    >
      <UiButton
        size="sm"
        icon="ph:plus"
        @click="modal = true"
      >
        Crear talla
      </UiButton>
    </UiEmptyState>

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="size in sizes.items"
        :key="size.id"
        type="button"
        :aria-pressed="draft.sizeIds.includes(size.id)"
        class="inline-flex h-9 min-w-12 items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]"
        :class="draft.sizeIds.includes(size.id)
          ? 'border-accent bg-accent text-accent-ink'
          : 'border-line bg-surface-raised text-ink hover:border-ink-muted'"
        @click="draft.toggleSize(size.id)"
      >
        {{ size.name }}
      </button>
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        @click="modal = true"
      >
        <Icon
          name="ph:plus"
          class="size-4"
          aria-hidden="true"
        />
        Nueva
      </button>
    </div>

    <p
      v-if="sizes.error"
      class="text-[13px] text-danger"
    >
      {{ sizes.error }}
    </p>

    <UiModal
      v-model:open="modal"
      title="Nueva talla"
      description="Se agrega al catálogo y queda elegida para este artículo."
    >
      <SizeForm @saved="onCreated" />
    </UiModal>
  </fieldset>
</template>
