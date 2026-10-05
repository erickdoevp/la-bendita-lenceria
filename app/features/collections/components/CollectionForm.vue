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
const uid = useId()
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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      :id="`${uid}-name`"
      v-slot="field"
      label="Nombre"
      :error="fieldErrors.name"
    >
      <UiInput
        :id="field.id"
        v-model="values.name"
        maxlength="120"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Verano 2026"
        autocomplete="off"
      />
    </UiField>

    <div class="grid gap-2">
      <UiField
        :id="`${uid}-slug`"
        v-slot="field"
        label="Slug (URL)"
        :optional="!isEdit"
        :hint="slugChanged
          ? `Quedará como ${STORE_COLLECTION_PATH}/${slugPreview}. Cambiar la URL rompe los enlaces viejos.`
          : `${STORE_COLLECTION_PATH}/${slugPreview || 'nombre-de-la-coleccion'}. Si ya existe se agrega -2.`"
        :error="fieldErrors.slug"
      >
        <UiInput
          :id="field.id"
          v-model="values.slug"
          class="font-mono text-sm"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          :placeholder="nameSlug || 'verano-2026'"
          autocomplete="off"
          spellcheck="false"
        />
      </UiField>
      <button
        v-if="suggestSlug"
        type="button"
        class="inline-flex items-center gap-1 justify-self-start text-[13px] text-accent hover:underline"
        @click="values.slug = nameSlug"
      >
        <Icon
          name="ph:link"
          class="size-3.5"
          aria-hidden="true"
        />
        Actualizar también la URL a /{{ nameSlug }}
      </button>
    </div>

    <UiField
      :id="`${uid}-description`"
      v-slot="field"
      label="Descripción"
      optional
      hint="Se muestra en la página de la colección. Separa párrafos con una línea en blanco."
      :error="fieldErrors.description"
    >
      <UiTextarea
        :id="field.id"
        v-model="values.description"
        :aria-describedby="field.describedBy"
        rows="4"
      />
    </UiField>

    <UiField
      :id="`${uid}-image`"
      :label="collection?.imageUrl ? 'Reemplazar portada' : 'Portada'"
      optional
    >
      <div class="grid gap-3">
        <img
          v-if="collection?.imageUrl && !values.images.length"
          :src="collection.imageUrl"
          :alt="`Portada de ${collection.name}`"
          class="aspect-[16/7] w-full rounded-xl border border-line object-cover"
        >
        <UiImagePicker
          :id="`${uid}-image`"
          v-model="values.images"
          :label="collection?.imageUrl ? 'Elegir otra imagen' : 'Elegir imagen de portada'"
          :error="fieldErrors.image"
          compact
        />
        <p
          v-if="collection?.imageUrl"
          class="text-[13px] text-ink-muted"
        >
          La portada se puede reemplazar, pero no quitar.
        </p>
      </div>
    </UiField>

    <UiSwitch
      :id="`${uid}-active`"
      v-model="values.active"
      label="Visible en la tienda"
      description="Apagada, solo la ves tú en el panel."
    />

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
        :icon="isEdit ? 'ph:floppy-disk' : 'ph:plus'"
      >
        {{ isEdit ? 'Guardar cambios' : 'Crear colección' }}
      </UiButton>
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>
