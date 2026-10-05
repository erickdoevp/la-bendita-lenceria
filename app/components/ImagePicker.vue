<script setup lang="ts">
/**
 * Selector de imagenes del panel sobre UFileUpload. Valida cada archivo con
 * imageFileSchema (mismos limites que el backend) y, con multiple, la primera
 * imagen es la principal (salvo markPrimary=false: se suman a una galeria que ya la tiene).
 */
const props = withDefaults(defineProps<{
  multiple?: boolean
  label?: string
  error?: string
  compact?: boolean
  markPrimary?: boolean
}>(), {
  label: 'Arrastra imágenes o haz clic para elegir',
  error: undefined,
  markPrimary: true,
})

const files = defineModel<File[]>({ required: true })
const rejected = ref<string | null>(null)

const uploadValue = computed(() => (props.multiple ? files.value : (files.value[0] ?? null)))

// UFileUpload devuelve la lista completa: se validan solo los archivos nuevos
function onUpdate(value: File[] | File | null | undefined) {
  const next = value ? (Array.isArray(value) ? value : [value]) : []
  rejected.value = null
  const accepted = next.filter((file) => {
    if (files.value.includes(file)) return true
    const result = imageFileSchema.safeParse(file)
    if (!result.success) rejected.value = `${file.name}: ${result.error.issues[0]?.message}`
    return result.success
  })
  files.value = props.multiple ? accepted : accepted.slice(-1)
}

function remove(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}

function makePrimary(index: number) {
  const next = [...files.value]
  const [file] = next.splice(index, 1)
  if (file) files.value = [file, ...next]
}
</script>

<template>
  <div class="grid gap-3">
    <UFileUpload
      :model-value="uploadValue"
      :multiple="multiple"
      :accept="IMAGE_ACCEPT"
      icon="ph:image-square"
      :label="label"
      description="JPG, PNG, WebP o AVIF. Máximo 10 MB cada una."
      :color="error || rejected ? 'error' : 'primary'"
      :highlight="Boolean(error || rejected)"
      :ui="{ base: compact ? 'py-4' : 'py-8' }"
      @update:model-value="onUpdate"
    >
      <template #files>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
          <ImageThumb
            v-for="(file, index) in files"
            :key="`${file.name}-${file.lastModified}-${index}`"
            :file="file"
            :primary="multiple && markPrimary && index === 0"
            :can-promote="multiple && markPrimary"
            @remove="remove(index)"
            @make-primary="makePrimary(index)"
          />
        </ul>
      </template>
    </UFileUpload>

    <p
      v-if="rejected || error"
      class="text-sm text-error"
    >
      {{ rejected ?? error }}
    </p>
  </div>
</template>
