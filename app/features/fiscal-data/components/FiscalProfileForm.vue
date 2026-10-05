<script setup lang="ts">
import { REGIMENES_FISCALES } from '../constants'
import { fiscalSchema } from '../schemas'
import { useFiscalStore } from '../stores/fiscal.store'
import type { FiscalProfile } from '../types'

const props = defineProps<{ profile?: FiscalProfile | null }>()
const emit = defineEmits<{ saved: [profile: FiscalProfile], cancel: [] }>()

const store = useFiscalStore()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const pending = ref(false)

const isEdit = computed(() => Boolean(props.profile))
const isFirst = computed(() => !isEdit.value && !store.items.length)

const p = props.profile
const values = reactive({
  rfc: p?.rfc ?? '',
  razonSocial: p?.razonSocial ?? '',
  regimenFiscal: p?.regimenFiscal ?? '',
  cp: p?.cp ?? '',
  // PUT es reemplazo completo: se manda siempre el valor actual
  isDefault: p?.isDefault ?? false,
})

for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => clearField(key))
}

// El SAT exige el RFC en mayusculas: se corrige mientras se escribe
watch(() => values.rfc, (value) => {
  const upper = value.toUpperCase()
  if (upper !== value) values.rfc = upper
})

/** 12 caracteres = persona moral, 13 = persona fisica. */
const personaHint = computed(() => {
  const length = values.rfc.trim().length
  if (length === 12) return 'RFC de persona moral (12 caracteres).'
  if (length === 13) return 'RFC de persona física (13 caracteres).'
  return '12 caracteres si es empresa, 13 si es persona física.'
})

async function onSubmit() {
  const payload = validate(fiscalSchema, { ...values, isDefault: values.isDefault || isFirst.value })
  if (!payload) return

  pending.value = true
  try {
    const saved = props.profile
      ? await store.update(props.profile.id, payload)
      : await store.create(payload)
    emit('saved', saved)
  }
  catch (error) {
    applyApiError(error)
  }
  finally {
    pending.value = false
  }
}

const regimenItems = REGIMENES_FISCALES.map(regimen => ({ label: `${regimen.value} · ${regimen.label}`, value: regimen.value }))
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
      label="RFC"
      :help="personaHint"
      :error="fieldErrors.rfc"
    >
      <UInput
        v-model="values.rfc"
        class="font-mono uppercase"
        maxlength="13"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
      />
    </UFormField>

    <UFormField
      label="Nombre o razón social"
      help="Exactamente como en tu Constancia de Situación Fiscal, sin «S.A. de C.V.»."
      :error="fieldErrors.razonSocial"
    >
      <UInput
        v-model="values.razonSocial"
      />
    </UFormField>

    <UFormField
      label="Régimen fiscal"
      :error="fieldErrors.regimenFiscal"
    >
      <USelect
        v-model="values.regimenFiscal"
        :items="regimenItems"
        placeholder="Elige tu régimen"
      />
    </UFormField>

    <UFormField
      label="Código postal fiscal"
      help="El de tu domicilio fiscal, no el de entrega."
      :error="fieldErrors.cp"
    >
      <UInput
        v-model="values.cp"
        class="max-w-40"
        inputmode="numeric"
        maxlength="5"
      />
    </UFormField>

    <USwitch
      v-if="!isFirst"
      v-model="values.isDefault"
      label="Usar como predeterminado"
      description="Lo proponemos primero al solicitar una factura."
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :label="isEdit ? 'Guardar cambios' : 'Guardar datos fiscales'"
      />
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
