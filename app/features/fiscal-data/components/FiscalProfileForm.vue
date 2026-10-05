<script setup lang="ts">
import { REGIMENES_FISCALES } from '../constants'
import { fiscalSchema } from '../schemas'
import { useFiscalStore } from '../stores/fiscal.store'
import type { FiscalProfile } from '../types'

const props = defineProps<{ profile?: FiscalProfile | null }>()
const emit = defineEmits<{ saved: [profile: FiscalProfile], cancel: [] }>()

const store = useFiscalStore()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const uid = useId()
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
      :id="`${uid}-rfc`"
      v-slot="field"
      label="RFC"
      :hint="personaHint"
      :error="fieldErrors.rfc"
    >
      <UiInput
        :id="field.id"
        v-model="values.rfc"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        class="font-mono uppercase"
        maxlength="13"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
      />
    </UiField>

    <UiField
      :id="`${uid}-razon`"
      v-slot="field"
      label="Nombre o razón social"
      hint="Exactamente como en tu Constancia de Situación Fiscal, sin «S.A. de C.V.»."
      :error="fieldErrors.razonSocial"
    >
      <UiInput
        :id="field.id"
        v-model="values.razonSocial"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
      />
    </UiField>

    <UiField
      :id="`${uid}-regimen`"
      v-slot="field"
      label="Régimen fiscal"
      :error="fieldErrors.regimenFiscal"
    >
      <UiSelect
        :id="field.id"
        v-model="values.regimenFiscal"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
      >
        <option
          value=""
          disabled
        >
          Elige tu régimen
        </option>
        <option
          v-for="regimen in REGIMENES_FISCALES"
          :key="regimen.value"
          :value="regimen.value"
        >
          {{ regimen.value }} · {{ regimen.label }}
        </option>
      </UiSelect>
    </UiField>

    <UiField
      :id="`${uid}-cp`"
      v-slot="field"
      label="Código postal fiscal"
      hint="El de tu domicilio fiscal, no el de entrega."
      :error="fieldErrors.cp"
    >
      <UiInput
        :id="field.id"
        v-model="values.cp"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        class="max-w-40"
        inputmode="numeric"
        maxlength="5"
      />
    </UiField>

    <UiSwitch
      v-if="!isFirst"
      :id="`${uid}-default`"
      v-model="values.isDefault"
      label="Usar como predeterminado"
      description="Lo proponemos primero al solicitar una factura."
    />

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Guardar datos fiscales' }}
      </UiButton>
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>
