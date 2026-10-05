<script setup lang="ts">
import { STORE_COLLECTION_PATH } from '../constants'
import { collectionSchema } from '../schemas'
import { useCollectionsApi } from '../services'
import { useCollectionsStore } from '../stores/collections.store'
import type { Collection, CollectionDetail, CollectionRequest } from '../types'

const props = defineProps<{ collection?: CollectionDetail | null }>()
const emit = defineEmits<{ saved: [collection: Collection], cancel: [] }>()

const api = useCollectionsApi()
const store = useCollectionsStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const pending = ref(false)
const isEdit = computed(() => Boolean(props.collection))

const initialValues = () => ({
  name: props.collection?.name ?? '',
  slug: props.collection?.slug ?? '',
  description: richTextToPlain(props.collection?.description),
  active: props.collection?.active ?? true,
  images: [] as File[],
})
const values = reactive(initialValues())
let initialDescription = values.description

watch(() => props.collection, () => {
  Object.assign(values, initialValues())
  initialDescription = values.description
  reset()
})

for (const field of ['name', 'slug', 'description'] as const) {
  watch(() => values[field], () => clearField(field))
}
watch(() => values.images, () => clearField('image'))

const nameSlug = computed(() => slugify(values.name))
const slugPreview = computed(() => slugify(values.slug) || nameSlug.value)
// Renombrar no cambia la URL: se ofrece actualizarla a mano
const suggestSlug = computed(() =>
  isEdit.value && nameSlug.value && values.name.trim() !== props.collection?.name && slugify(values.slug) !== nameSlug.value,
)
const slugChanged = computed(() => isEdit.value && slugify(values.slug) !== props.collection?.slug)

onMounted(() => {
  // Para crear al final de la tienda se necesita la posicion mas alta
  if (!isEdit.value) void store.ensureLoaded()
})

function buildRequest(parsed: ReturnType<typeof collectionSchema.parse>): CollectionRequest {
  if (!props.collection) {
    return {
      name: parsed.name,
      slug: parsed.slug,
      description: toRichTextDoc(parsed.description),
      active: parsed.active,
      position: store.nextPosition,
    }
  }
  // PUT parcial: la descripcion solo se manda si cambio (no pisar formato del editor de la tienda)
  const descriptionChanged = parsed.description.trim() !== initialDescription
  return {
    name: parsed.name,
    // Reenviar el mismo slug no lo toca
    slug: parsed.slug,
    description: descriptionChanged ? (toRichTextDoc(parsed.description) ?? EMPTY_RICH_TEXT) : undefined,
    active: parsed.active,
  }
}

async function onSubmit() {
  const parsed = validate(collectionSchema, { ...values, image: values.images[0] ?? null })
  if (!parsed) return

  pending.value = true
  try {
    const data = buildRequest(parsed)
    const saved = props.collection
      ? await api.update(props.collection.id, data, parsed.image)
      : await api.create(data, parsed.image)
    store.upsert(saved)
    emit('saved', saved)
  }
  catch (error) {
    applyApiError(error)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid gap-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Nombre"
      :error="fieldErrors.name"
    >
      <UInput
        v-model="values.name"
        maxlength="120"
        placeholder="Verano 2026"
        autocomplete="off"
      />
    </UFormField>

    <div class="grid gap-2">
      <UFormField
        label="Slug (URL)"
        :hint="(!isEdit) ? 'Opcional' : undefined"
        :help="slugChanged
          ? `Quedará como ${STORE_COLLECTION_PATH}/${slugPreview}. Cambiar la URL rompe los enlaces viejos.`
          : `${STORE_COLLECTION_PATH}/${slugPreview || 'nombre-de-la-coleccion'}. Si ya existe se agrega -2.`"
        :error="fieldErrors.slug"
      >
        <UInput
          v-model="values.slug"
          class="font-mono text-sm"
          :placeholder="nameSlug || 'verano-2026'"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormField>
      <UButton
        v-if="suggestSlug"
        variant="link"
        size="xs"
        icon="ph:link"
        :label="`Actualizar también la URL a /${nameSlug}`"
        class="justify-self-start px-0"
        @click="values.slug = nameSlug"
      />
    </div>

    <UFormField
      label="Descripción"
      help="Se muestra en la página de la colección. Separa párrafos con una línea en blanco."
      :error="fieldErrors.description"
      hint="Opcional"
    >
      <UTextarea
        v-model="values.description"
        :rows="4"
        autoresize
      />
    </UFormField>

    <UFormField
      :label="collection?.imageUrl ? 'Reemplazar portada' : 'Portada'"
      hint="Opcional"
    >
      <div class="grid gap-3">
        <img
          v-if="collection?.imageUrl && !values.images.length"
          :src="collection.imageUrl"
          :alt="`Portada de ${collection.name}`"
          class="aspect-[16/7] w-full rounded-lg border border-default object-cover"
        >
        <ImagePicker
          v-model="values.images"
          :label="collection?.imageUrl ? 'Elegir otra imagen' : 'Elegir imagen de portada'"
          :error="fieldErrors.image"
          compact
        />
        <p
          v-if="collection?.imageUrl"
          class="text-sm text-muted"
        >
          La portada se puede reemplazar, pero no quitar.
        </p>
      </div>
    </UFormField>

    <USwitch
      v-model="values.active"
      label="Visible en la tienda"
      description="Apagada, solo la ves tú en el panel."
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :icon="isEdit ? 'ph:floppy-disk' : 'ph:plus'"
        :label="isEdit ? 'Guardar cambios' : 'Crear colección'"
      />
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
