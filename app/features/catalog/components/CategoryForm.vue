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
const uid = useId()
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
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Brasieres"
        autocomplete="off"
      />
    </UiField>

    <div class="grid gap-2">
      <UiField
        :id="`${uid}-slug`"
        v-slot="field"
        label="Slug"
        :optional="!isEdit"
        :hint="isEdit ? 'Cambiarlo rompe los enlaces viejos a esta categoría.' : 'Si lo dejas vacío se genera del nombre.'"
        :error="fieldErrors.slug"
      >
        <UiInput
          :id="field.id"
          v-model="values.slug"
          :class="isEdit && 'font-mono text-sm'"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          :placeholder="nameSlug || 'brasieres'"
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
        Actualizar también el slug a {{ nameSlug }}
      </button>
    </div>

    <UiField
      :id="`${uid}-parent`"
      v-slot="field"
      label="Categoría padre"
      optional
      :error="fieldErrors.parentId"
    >
      <CategorySelect
        :id="field.id"
        v-model="values.parentId"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :exclude-id="category?.id"
        :current="category?.parent"
        empty-label="Ninguna (categoría raíz)"
      />
    </UiField>

    <UiField
      :id="`${uid}-description`"
      v-slot="field"
      label="Descripción"
      optional
      hint="Separa párrafos con una línea en blanco."
    >
      <UiTextarea
        :id="field.id"
        v-model="values.description"
        :aria-describedby="field.describedBy"
        rows="3"
      />
    </UiField>

    <UiField
      :id="`${uid}-image`"
      :label="category?.imageUrl ? 'Reemplazar imagen' : 'Imagen'"
      optional
    >
      <div class="grid gap-3">
        <div
          v-if="category?.imageUrl && !values.images.length"
          class="flex items-center gap-3"
        >
          <img
            :src="category.imageUrl"
            :alt="`Imagen actual de ${category.name}`"
            class="size-16 shrink-0 rounded-xl border border-line object-cover"
          >
          <p class="text-[13px] text-ink-muted">
            Imagen actual. Se puede reemplazar, pero no quitar.
          </p>
        </div>
        <UiImagePicker
          :id="`${uid}-image`"
          v-model="values.images"
          :label="category?.imageUrl ? 'Elegir otra imagen' : 'Elegir imagen de portada'"
          :error="fieldErrors.image"
          compact
        />
      </div>
    </UiField>

    <UiSwitch
      :id="`${uid}-active`"
      v-model="values.active"
      label="Activa"
      description="Las inactivas no aparecen en la tienda ni en el selector de artículos."
    />

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Crear categoría' }}
      </UiButton>
      <UiButton
        v-if="isEdit"
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>
