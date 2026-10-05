<script setup lang="ts">
import { ColorSwatch } from '~/features/catalog'
import { useProductDraftStore } from '../stores/product-draft.store'

const props = defineProps<{
  colorId: string
  name: string
  hex: string
}>()

const draft = useProductDraftStore()
const errorKey = computed(() => `colorImages.${props.colorId}`)

const files = computed({
  get: () => draft.colorImages[props.colorId] ?? [],
  set: (value: File[]) => {
    draft.colorImages = { ...draft.colorImages, [props.colorId]: value }
    draft.clearError(errorKey.value)
  },
})
</script>

<template>
  <div class="grid gap-3">
    <p class="flex items-center gap-2.5 text-sm font-medium text-highlighted">
      <ColorSwatch
        :hex="hex"
        size="sm"
      />
      {{ name }}
      <span class="font-normal text-muted">{{ files.length }} {{ files.length === 1 ? 'foto' : 'fotos' }}</span>
    </p>
    <ImagePicker
      v-model="files"
      multiple
      compact
      :label="`Fotos en ${name}`"
      :error="draft.fieldErrors[errorKey]"
    />
  </div>
</template>
