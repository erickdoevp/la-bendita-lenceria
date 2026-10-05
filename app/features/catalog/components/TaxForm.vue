<script setup lang="ts">
import { taxSchema } from '../schemas'
import { useTaxesStore } from '../stores/taxes.store'
import type { TaxConfig } from '../types'

const emit = defineEmits<{ saved: [tax: TaxConfig] }>()

const store = useTaxesStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const values = reactive({ name: '', rate: '' as string | number, active: false })
const pending = ref(false)
const uid = useId()

watch(() => values.name, () => clearField('name'))
watch(() => values.rate, () => clearField('rate'))

async function onSubmit() {
  const payload = validate(taxSchema, values)
  if (!payload) return

  pending.value = true
  try {
    emit('saved', await store.create(payload))
    Object.assign(values, { name: '', rate: '', active: false })
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

    <UiSwitch
      :id="`${uid}-active`"
      v-model="values.active"
      label="Usar como IVA global"
      description="Reemplaza al IVA activo actual."
    />

    <UiButton
      type="submit"
      class="justify-self-start"
      :loading="pending"
    >
      Crear impuesto
    </UiButton>
  </form>
</template>
