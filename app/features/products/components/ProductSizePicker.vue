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
    <legend class="mb-3 text-sm font-medium text-highlighted">
      Tallas
    </legend>

    <div
      v-if="sizes.status === 'pending'"
      class="flex flex-wrap gap-2"
    >
      <USkeleton
        v-for="n in 5"
        :key="n"
        class="h-9 w-14 rounded-full"
      />
    </div>

    <UEmpty
      v-else-if="sizes.status === 'ready' && !sizes.items.length"
      icon="ph:ruler"
      title="Aún no hay tallas"
      description="Las tallas son un catálogo global. Crea las que manejas."
    >
      <template #actions>
        <UButton
          size="sm"
          icon="ph:plus"
          label="Crear talla"
          @click="modal = true"
        />
    
      </template>
    </UEmpty>

    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <UButton
        v-for="size in sizes.items"
        :key="size.id"
        :color="draft.sizeIds.includes(size.id) ? 'primary' : 'neutral'"
        :variant="draft.sizeIds.includes(size.id) ? 'solid' : 'outline'"
        :aria-pressed="draft.sizeIds.includes(size.id)"
        :label="size.name"
        class="min-w-12 justify-center rounded-full"
        @click="draft.toggleSize(size.id)"
      />
      <UButton
        color="neutral"
        variant="ghost"
        icon="ph:plus"
        label="Nueva"
        class="rounded-full"
        @click="modal = true"
      />
    </div>

    <p
      v-if="sizes.error"
      class="text-sm text-error"
    >
      {{ sizes.error }}
    </p>

    <UModal
      v-model:open="modal"
      title="Nueva talla"
      description="Se agrega al catálogo y queda elegida para este artículo."
    >
      <template #body>
        <SizeForm @saved="onCreated" />
    
      </template>
    </UModal>
  </fieldset>
</template>
