<script setup lang="ts">
import type { Color } from '~/features/catalog'
import { ColorForm, ColorSwatch, useColorsStore } from '~/features/catalog'
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const colors = useColorsStore()
const modal = ref(false)

function onCreated(color: Color) {
  modal.value = false
  draft.toggleColor(color.id)
}
</script>

<template>
  <fieldset class="grid gap-3">
    <legend class="mb-3 text-sm font-medium text-ink">
      Colores
    </legend>

    <div
      v-if="colors.status === 'pending'"
      class="flex flex-wrap gap-2"
    >
      <UiSkeleton
        v-for="n in 4"
        :key="n"
        class="h-9 w-24 rounded-full"
      />
    </div>

    <UiEmptyState
      v-else-if="colors.status === 'ready' && !colors.items.length"
      icon="ph:palette"
      title="Aún no hay colores"
      description="Los colores son un catálogo global. Crea los de tus prendas."
    >
      <UiButton
        size="sm"
        icon="ph:plus"
        @click="modal = true"
      >
        Crear color
      </UiButton>
    </UiEmptyState>

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="color in colors.items"
        :key="color.id"
        type="button"
        :aria-pressed="draft.colorIds.includes(color.id)"
        class="inline-flex h-9 items-center gap-2 rounded-full border pl-1.5 pr-3.5 text-sm font-medium transition-[background-color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]"
        :class="draft.colorIds.includes(color.id)
          ? 'border-accent bg-accent/10 text-ink ring-1 ring-accent'
          : 'border-line bg-surface-raised text-ink hover:border-ink-muted'"
        @click="draft.toggleColor(color.id)"
      >
        <ColorSwatch :hex="color.hex" />
        {{ color.name }}
        <Icon
          v-if="draft.colorIds.includes(color.id)"
          name="ph:check-bold"
          class="size-3.5 text-accent"
          aria-hidden="true"
        />
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
        Nuevo
      </button>
    </div>

    <p
      v-if="colors.error"
      class="text-[13px] text-danger"
    >
      {{ colors.error }}
    </p>

    <UiModal
      v-model:open="modal"
      title="Nuevo color"
      description="Se agrega al catálogo y queda elegido para este artículo."
    >
      <ColorForm @saved="onCreated" />
    </UiModal>
  </fieldset>
</template>
