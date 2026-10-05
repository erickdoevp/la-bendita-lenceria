<script setup lang="ts">
import { categorySchema } from '../schemas'
import { useCategoriesStore } from '../stores/categories.store'
import type { Category } from '../types'
import CategorySelect from './CategorySelect.vue'

const props = defineProps<{ defaultParentId?: string }>()
const emit = defineEmits<{ saved: [category: Category] }>()

const store = useCategoriesStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const pending = ref(false)
const uid = useId()

const initialValues = () => ({
  name: '',
  slug: '',
  description: '',
  parentId: props.defaultParentId ?? '',
  active: true,
  images: [] as File[],
})
const values = reactive(initialValues())
const slugPreview = computed(() => slugify(values.name))

onMounted(() => store.fetchTree())

for (const field of ['name', 'slug', 'parentId'] as const) {
  watch(() => values[field], () => clearField(field))
}
watch(() => values.images, () => clearField('image'))

async function onSubmit() {
  const parsed = validate(categorySchema, { ...values, image: values.images[0] ?? null })
  if (!parsed) return

  const { image, ...data } = parsed
  pending.value = true
  try {
    emit('saved', await store.create(data, image))
    Object.assign(values, initialValues())
    reset()
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
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Brasieres"
        autocomplete="off"
      />
    </UiField>

    <UiField
      :id="`${uid}-slug`"
      v-slot="field"
      label="Slug"
      optional
      hint="Si lo dejas vacío se genera del nombre."
      :error="fieldErrors.slug"
    >
      <UiInput
        :id="field.id"
        v-model="values.slug"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :placeholder="slugPreview || 'brasieres'"
        autocomplete="off"
        spellcheck="false"
      />
    </UiField>

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
      label="Imagen"
      optional
    >
      <UiImagePicker
        :id="`${uid}-image`"
        v-model="values.images"
        label="Elegir imagen de portada"
        :error="fieldErrors.image"
        compact
      />
    </UiField>

    <UiSwitch
      :id="`${uid}-active`"
      v-model="values.active"
      label="Activa"
      description="Las inactivas no aparecen en la tienda ni en el selector de artículos."
    />

    <UiButton
      type="submit"
      class="justify-self-start"
      :loading="pending"
    >
      Crear categoría
    </UiButton>
  </form>
</template>
