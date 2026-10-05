<script setup lang="ts">
import { taxSchema } from '../schemas'
import { useTaxesStore } from '../stores/taxes.store'
import type { TaxConfig } from '../types'

const props = defineProps<{ tax?: TaxConfig | null }>()
const emit = defineEmits<{ saved: [tax: TaxConfig], cancel: [] }>()

const store = useTaxesStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const pending = ref(false)
const uid = useId()
const isEdit = computed(() => Boolean(props.tax))
// El IVA global no se apaga desde aqui: se reemplaza activando otro
const isGlobal = computed(() => Boolean(props.tax?.active))

const initialValues = () => ({
  name: props.tax?.name ?? '',
  rate: (props.tax ? Number((props.tax.rate * 100).toFixed(2)) : '') as string | number,
  active: props.tax?.active ?? false,
})
const values = reactive(initialValues())

function fill() {
  Object.assign(values, initialValues())
  reset()
}

watch(() => props.tax, fill)
watch(() => values.name, () => clearField('name'))
watch(() => values.rate, () => clearField('rate'))

async function onSubmit() {
  const payload = validate(taxSchema, values)
  if (!payload) return

  pending.value = true
  try {
    if (props.tax) {
      emit('saved', await store.update(props.tax.id, payload))
    }
    else {
      emit('saved', await store.create(payload))
      fill()
    }
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
        placeholder="IVA Frontera 8%"
        autocomplete="off"
      />
    </UiField>

    <UiField
      :id="`${uid}-rate`"
      v-slot="field"
      label="Porcentaje"
      hint="Escribe 16 para un IVA del 16 %."
      :error="fieldErrors.rate"
    >
      <UiInput
        :id="field.id"
        v-model="values.rate"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        type="number"
        min="0"
        max="100"
        step="0.01"
        inputmode="decimal"
        suffix="%"
      />
    </UiField>

    <p
      v-if="isGlobal"
      class="flex items-start gap-2 text-[13px] text-ink-muted"
    >
      <Icon
        name="ph:check-circle-fill"
        class="mt-0.5 size-4 shrink-0 text-accent"
        aria-hidden="true"
      />
      Es el IVA global. Para dejar de usarlo, activa otro impuesto.
    </p>
    <UiSwitch
      v-else
      :id="`${uid}-active`"
      v-model="values.active"
      label="Usar como IVA global"
      description="Reemplaza al IVA activo actual."
    />

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Crear impuesto' }}
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
