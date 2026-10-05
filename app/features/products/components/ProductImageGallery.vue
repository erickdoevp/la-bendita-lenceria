<script setup lang="ts">
import { ColorSwatch } from '~/features/catalog'
import { useProductsApi } from '../services'
import { useProductEditStore } from '../stores/product-edit.store'
import type { ProductImage } from '../types'

const props = defineProps<{
  /** null = galeria general. */
  colorId: string | null
  name: string
  hex?: string
  images: ProductImage[]
  /** El backend solo acepta fotos de colores con alguna variante. */
  canUpload: boolean
}>()

const store = useProductEditStore()
const api = useProductsApi()

const files = ref<File[]>([])
const uploading = ref(false)
const busyId = ref<string | null>(null)
const confirmingId = ref<string | null>(null)
const error = ref<string | null>(null)

const overLimit = computed(() => totalBytes(files.value) > MAX_REQUEST_BYTES)
const hasPrimary = computed(() => props.images.some(i => i.isPrimary))

watch(files, () => {
  error.value = null
})

async function run(task: () => Promise<unknown>) {
  error.value = null
  try {
    await task()
    await store.refresh()
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
}

async function upload() {
  if (!files.value.length || overLimit.value) return
  uploading.value = true
  await run(async () => {
    await api.addImages(store.product!.id, files.value, props.colorId)
    files.value = []
  })
  uploading.value = false
}

async function makePrimary(image: ProductImage) {
  busyId.value = image.id
  await run(() => api.updateImage(store.product!.id, image.id, { isPrimary: true }))
  busyId.value = null
}

async function remove(image: ProductImage) {
  busyId.value = image.id
  await run(() => api.removeImage(store.product!.id, image.id))
  busyId.value = null
  confirmingId.value = null
}
</script>

<template>
  <div class="grid gap-3">
    <p class="flex items-center gap-2.5 text-sm font-medium text-highlighted">
      <ColorSwatch
        v-if="hex"
        :hex="hex"
        size="sm"
      />
      {{ name }}
      <span class="font-normal text-muted">{{ images.length }} {{ images.length === 1 ? 'foto' : 'fotos' }}</span>
    </p>

    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error"
    />
    <p
      v-else-if="images.length && !hasPrimary"
      class="text-sm text-warning"
    >
      Esta galería no tiene foto principal. Elige una.
    </p>

    <ul
      v-if="images.length"
      class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3"
    >
      <li
        v-for="image in images"
        :key="image.id"
        class="grid content-start gap-1.5"
      >
        <div
          class="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted transition-opacity"
          :class="[image.isPrimary ? 'border-primary' : 'border-default', busyId === image.id && 'opacity-50']"
        >
          <img
            :src="image.url"
            :alt="image.altText ?? `${name}, foto ${image.position + 1}`"
            loading="lazy"
            class="size-full object-cover"
          >
          <UButton
            v-if="confirmingId !== image.id"
            color="neutral"
            variant="solid"
            size="xs"
            icon="ph:trash"
            class="absolute right-1.5 top-1.5"
            :disabled="Boolean(busyId)"
            :aria-label="`Eliminar foto ${image.position + 1} de ${name}`"
            @click="confirmingId = image.id"
          />
        </div>

        <div
          v-if="confirmingId === image.id"
          class="flex flex-wrap items-center gap-1"
        >
          <UButton
            color="error"
            variant="soft"
            size="xs"
            label="Eliminar"
            :loading="busyId === image.id"
            @click="remove(image)"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            label="No"
            :disabled="busyId === image.id"
            @click="confirmingId = null"
          />
        </div>
        <p
          v-else-if="image.isPrimary"
          class="flex items-center gap-1 text-xs font-medium text-primary"
        >
          <UIcon
            name="ph:star-fill"
            class="size-3.5"
          />
          Principal
        </p>
        <UButton
          v-else
          color="neutral"
          variant="link"
          size="xs"
          label="Hacer principal"
          class="justify-self-start px-0"
          :disabled="Boolean(busyId)"
          @click="makePrimary(image)"
        />
      </li>
    </ul>

    <template v-if="canUpload">
      <ImagePicker
        v-model="files"
        multiple
        compact
        :mark-primary="!images.length"
        :label="images.length ? `Agregar fotos a ${name}` : `Fotos en ${name}`"
        :error="overLimit ? `Las imágenes suman ${formatBytes(totalBytes(files))}; el máximo por envío es 100 MB.` : undefined"
      />
      <div
        v-if="files.length"
        class="flex justify-end gap-2"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          label="Cancelar"
          :disabled="uploading"
          @click="files = []"
        />
        <UButton
          size="sm"
          icon="ph:upload-simple"
          :loading="uploading"
          :disabled="overLimit"
          :label="`Subir ${files.length} ${files.length === 1 ? 'foto' : 'fotos'}`"
          @click="upload"
        />
      </div>
    </template>
    <p
      v-else
      class="text-sm text-muted"
    >
      Este color ya no tiene variantes. Puedes quitar sus fotos; para subir nuevas, agrega una variante en este color.
    </p>
  </div>
</template>
