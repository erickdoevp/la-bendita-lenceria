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
const uid = useId()

const validHex = computed(() => /^#[0-9A-Fa-f]{6}$/.test(values.hex.trim()))

function fill() {
  values.name = props.color?.name ?? ''
  values.hex = props.color?.hex ?? '#B4235A'
  reset()
}

watch(() => props.color, fill, { immediate: true })
watch(() => values.name, () => clearField('name'))
watch(() => values.hex, () => clearField('hex'))

function onPick(event: Event) {
  values.hex = (event.target as HTMLInputElement).value.toUpperCase()
}

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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      :id="`${uid}-name`"
      v-slot="field"
      label="Nombre"
      hint="Las 3 primeras letras van al SKU: Rojo Intenso pasa a ROJ."
      :error="fieldErrors.name"
    >
      <UiInput
        :id="field.id"
        v-model="values.name"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Vino"
        autocomplete="off"
      />
    </UiField>

    <UiField
      :id="`${uid}-hex`"
      v-slot="field"
      label="Color"
      :error="fieldErrors.hex"
    >
      <div class="flex items-center gap-3">
        <label class="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-line focus-within:ring-3 focus-within:ring-accent/20">
          <ColorSwatch :hex="validHex ? values.hex : 'transparent'" />
          <input
            type="color"
            class="absolute inset-0 cursor-pointer opacity-0"
            :value="validHex ? values.hex.toLowerCase() : '#000000'"
            aria-label="Elegir color en la paleta"
            @input="onPick"
          >
        </label>
        <UiInput
          :id="field.id"
          v-model="values.hex"
          class="flex-1"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          placeholder="#FF2400"
          maxlength="7"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </UiField>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Crear color' }}
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
