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
    <legend class="mb-3 text-sm font-medium text-highlighted">
      Colores
    </legend>

    <div
      v-if="colors.status === 'pending'"
      class="flex flex-wrap gap-2"
    >
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="h-9 w-24 rounded-full"
      />
    </div>

    <UEmpty
      v-else-if="colors.status === 'ready' && !colors.items.length"
      icon="ph:palette"
      title="Aún no hay colores"
      description="Los colores son un catálogo global. Crea los de tus prendas."
    >
      <template #actions>
        <UButton
          size="sm"
          icon="ph:plus"
          label="Crear color"
          @click="modal = true"
        />
    
      </template>
    </UEmpty>

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <UButton
        v-for="color in colors.items"
        :key="color.id"
        :color="draft.colorIds.includes(color.id) ? 'primary' : 'neutral'"
        :variant="draft.colorIds.includes(color.id) ? 'subtle' : 'outline'"
        :aria-pressed="draft.colorIds.includes(color.id)"
        :trailing-icon="draft.colorIds.includes(color.id) ? 'ph:check-bold' : undefined"
        class="rounded-full ps-1.5"
        @click="draft.toggleColor(color.id)"
      >
        <template #leading>
          <ColorSwatch :hex="color.hex" />
        </template>
        <span class="text-highlighted">{{ color.name }}</span>
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        icon="ph:plus"
        label="Nuevo"
        class="rounded-full"
        @click="modal = true"
      />
    </div>

    <p
      v-if="colors.error"
      class="text-sm text-error"
    >
      {{ colors.error }}
    </p>

    <UModal
      v-model:open="modal"
      title="Nuevo color"
      description="Se agrega al catálogo y queda elegido para este artículo."
    >
      <template #body>
        <ColorForm @saved="onCreated" />
    
      </template>
    </UModal>
  </fieldset>
</template>
