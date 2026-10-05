<script setup lang="ts">
import { categorySchema } from '../schemas'
import type { CategoryFormOutput, CategoryUpdateRequest } from '../schemas'
import { useCategoriesStore } from '../stores/categories.store'
import type { Category } from '../types'
import CategorySelect from './CategorySelect.vue'

const props = defineProps<{
  defaultParentId?: string
  category?: Category | null
}>()
const emit = defineEmits<{ saved: [category: Category], cancel: [] }>()

const store = useCategoriesStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const pending = ref(false)
const isEdit = computed(() => Boolean(props.category))

const initialValues = () => ({
  name: props.category?.name ?? '',
  slug: props.category?.slug ?? '',
  description: richTextToPlain(props.category?.description),
  parentId: props.category ? (props.category.parent?.id ?? '') : (props.defaultParentId ?? ''),
  active: props.category?.active ?? true,
  images: [] as File[],
})
const values = reactive(initialValues())
let initialDescription = values.description

const nameSlug = computed(() => slugify(values.name))
// Renombrar no cambia la URL: se ofrece actualizarla a mano
const suggestSlug = computed(() =>
  isEdit.value && nameSlug.value && values.name.trim() !== props.category?.name && slugify(values.slug) !== nameSlug.value,
)

function fill() {
  Object.assign(values, initialValues())
  initialDescription = values.description
  reset()
}

onMounted(() => store.fetchTree())

watch(() => props.category, fill)
for (const field of ['name', 'slug', 'parentId'] as const) {
  watch(() => values[field], () => clearField(field))
}
watch(() => values.images, () => clearField('image'))

function toUpdateRequest({ image: _image, ...data }: CategoryFormOutput): CategoryUpdateRequest {
  // PUT parcial: la descripcion solo se manda si cambio; vacia se borra con un documento vacio
  const descriptionChanged = values.description.trim() !== initialDescription
  return {
    ...data,
    description: descriptionChanged ? (data.description ?? EMPTY_RICH_TEXT) : undefined,
  }
}

async function onSubmit() {
  const parsed = validate(categorySchema, { ...values, image: values.images[0] ?? null })
  if (!parsed) return

  pending.value = true
  try {
    if (props.category) {
      emit('saved', await store.update(props.category.id, toUpdateRequest(parsed), parsed.image))
    }
    else {
      const { image, ...data } = parsed
      emit('saved', await store.create(data, image))
      fill()
    }
  }
  catch (error) {
    applyApiError(error, { conflict: 'Ya existe una categoría con ese slug.' })
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
        placeholder="Brasieres"
        autocomplete="off"
      />
    </UFormField>

    <div class="grid gap-2">
      <UFormField
        label="Slug"
        :hint="isEdit ? undefined : 'Opcional'"
        :help="isEdit ? 'Cambiarlo rompe los enlaces viejos a esta categoría.' : 'Si lo dejas vacío se genera del nombre.'"
        :error="fieldErrors.slug"
      >
        <UInput
          v-model="values.slug"
          :ui="{ base: isEdit ? 'font-mono' : undefined }"
          :placeholder="nameSlug || 'brasieres'"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormField>
      <UButton
        v-if="suggestSlug"
        variant="link"
        size="xs"
        icon="ph:link"
        :label="`Actualizar también el slug a ${nameSlug}`"
        class="justify-self-start px-0"
        @click="values.slug = nameSlug"
      />
    </div>

    <UFormField
      label="Categoría padre"
      hint="Opcional"
      :error="fieldErrors.parentId"
    >
      <CategorySelect
        v-model="values.parentId"
        :exclude-id="category?.id"
        :current="category?.parent"
        empty-label="Ninguna (categoría raíz)"
      />
    </UFormField>

    <UFormField
      label="Descripción"
      hint="Opcional"
      help="Separa párrafos con una línea en blanco."
    >
      <UTextarea
        v-model="values.description"
        :rows="3"
        autoresize
      />
    </UFormField>

    <UFormField
      :label="category?.imageUrl ? 'Reemplazar imagen' : 'Imagen'"
      hint="Opcional"
    >
      <div class="grid gap-3">
        <div
          v-if="category?.imageUrl && !values.images.length"
          class="flex items-center gap-3"
        >
          <img
            :src="category.imageUrl"
            :alt="`Imagen actual de ${category.name}`"
            class="size-16 shrink-0 rounded-lg border border-default object-cover"
          >
          <p class="text-sm text-muted">
            Imagen actual. Se puede reemplazar, pero no quitar.
          </p>
        </div>
        <ImagePicker
          v-model="values.images"
          :label="category?.imageUrl ? 'Elegir otra imagen' : 'Elegir imagen de portada'"
          :error="fieldErrors.image"
          compact
        />
      </div>
    </UFormField>

    <USwitch
      v-model="values.active"
      label="Activa"
      description="Las inactivas no aparecen en la tienda ni en el selector de artículos."
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :label="isEdit ? 'Guardar cambios' : 'Crear categoría'"
      />
      <UButton
        v-if="isEdit"
        color="neutral"
        variant="outline"
        label="Cancelar"
        :disabled="pending"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
