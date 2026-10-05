<script setup lang="ts">
import { sizeSchema } from '../schemas'
import { useSizesStore } from '../stores/sizes.store'
import type { Size } from '../types'

const props = defineProps<{ size?: Size | null }>()
const emit = defineEmits<{ saved: [size: Size], cancel: [] }>()

const store = useSizesStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const values = reactive({ name: '', sortOrder: '' as string | number })
const pending = ref(false)
const isEdit = computed(() => Boolean(props.size))
const uid = useId()

function fill() {
  values.name = props.size?.name ?? ''
  values.sortOrder = props.size?.sortOrder ?? store.nextSortOrder
  reset()
}

watch(() => props.size, fill, { immediate: true })
// La lista puede llegar despues de montar: el orden sugerido se actualiza mientras no se edite
watch(() => store.nextSortOrder, (next, previous) => {
  if (!isEdit.value && values.sortOrder === previous) values.sortOrder = next
})
watch(() => values.name, () => clearField('name'))
watch(() => values.sortOrder, () => clearField('sortOrder'))

async function onSubmit() {
  const payload = validate(sizeSchema, values)
  if (!payload) return

  pending.value = true
  try {
    const saved = props.size ? await store.update(props.size.id, payload) : await store.create(payload)
    emit('saved', saved)
    if (!isEdit.value) fill()
  }
  catch (error) {
    applyApiError(error, { conflict: 'Ya existe una talla con ese nombre.' })
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

    <div class="grid grid-cols-[minmax(0,1fr)_7rem] gap-4">
      <UiField
        :id="`${uid}-name`"
        v-slot="field"
        label="Nombre"
        hint="Corto, se usa tal cual en el SKU."
        :error="fieldErrors.name"
      >
        <UiInput
          :id="field.id"
          v-model="values.name"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          placeholder="M"
          autocomplete="off"
        />
      </UiField>
      <UiField
        :id="`${uid}-order`"
        v-slot="field"
        label="Orden"
        :error="fieldErrors.sortOrder"
      >
        <UiInput
          :id="field.id"
          v-model="values.sortOrder"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
        />
      </UiField>
    </div>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Crear talla' }}
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
