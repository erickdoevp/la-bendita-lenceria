<script setup lang="ts">
import { colorSchema } from '../schemas'
import { useColorsStore } from '../stores/colors.store'
import type { Color } from '../types'
import ColorSwatch from './ColorSwatch.vue'

const props = defineProps<{ color?: Color | null }>()
const emit = defineEmits<{ saved: [color: Color], cancel: [] }>()

const store = useColorsStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const values = reactive({ name: '', hex: '#B4235A' })
const pending = ref(false)
const isEdit = computed(() => Boolean(props.color))

const validHex = computed(() => /^#[0-9A-Fa-f]{6}$/.test(values.hex.trim()))

function fill() {
  values.name = props.color?.name ?? ''
  values.hex = props.color?.hex ?? '#B4235A'
  reset()
}

watch(() => props.color, fill, { immediate: true })
watch(() => values.name, () => clearField('name'))
watch(() => values.hex, () => clearField('hex'))

// El selector solo recibe hex validos; lo escrito a mano se valida al guardar
const picked = computed({
  get: () => (validHex.value ? values.hex.toUpperCase() : '#000000'),
  set: (value: string) => {
    values.hex = value.toUpperCase()
  },
})

async function onSubmit() {
  const payload = validate(colorSchema, values)
  if (!payload) return

  pending.value = true
  try {
    const saved = props.color ? await store.update(props.color.id, payload) : await store.create(payload)
    emit('saved', saved)
    if (!isEdit.value) fill()
  }
  catch (error) {
    applyApiError(error, { conflict: 'Ya existe un color con ese nombre.' })
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
      help="Las 3 primeras letras van al SKU: Rojo Intenso pasa a ROJ."
      :error="fieldErrors.name"
    >
      <UInput
        v-model="values.name"
        placeholder="Vino"
        autocomplete="off"
      />
    </UFormField>

    <UFormField
      label="Color"
      :error="fieldErrors.hex"
    >
      <UInput
        v-model="values.hex"
        placeholder="#FF2400"
        maxlength="7"
        autocomplete="off"
        spellcheck="false"
        :ui="{ base: 'font-mono', leading: 'ps-1.5' }"
      >
        <template #leading>
          <UPopover>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Elegir color en la paleta"
            >
              <ColorSwatch
                :hex="validHex ? values.hex : 'transparent'"
                size="sm"
              />
            </UButton>
            <template #content>
              <UColorPicker
                v-model="picked"
                class="p-2"
              />
            </template>
          </UPopover>
        </template>
      </UInput>
    </UFormField>

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :label="isEdit ? 'Guardar cambios' : 'Crear color'"
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
