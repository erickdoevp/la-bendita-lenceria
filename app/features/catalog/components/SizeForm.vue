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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <div class="grid grid-cols-[minmax(0,1fr)_7rem] gap-4">
      <UFormField
        label="Nombre"
        help="Corto, se usa tal cual en el SKU."
        :error="fieldErrors.name"
      >
        <UInput
          v-model="values.name"
          placeholder="M"
          autocomplete="off"
        />
      </UFormField>
      <UFormField
        label="Orden"
        :error="fieldErrors.sortOrder"
      >
        <UInput
          v-model.number="values.sortOrder"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
        />
      </UFormField>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :label="isEdit ? 'Guardar cambios' : 'Crear talla'"
      />
      <UButton
        v-if="isEdit"
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
