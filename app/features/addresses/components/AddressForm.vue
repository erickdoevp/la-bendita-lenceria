<script setup lang="ts">
import { usePostalCodeLookup } from '../composables/usePostalCodeLookup'
import { addressSchema } from '../schemas'
import { useAddressesStore } from '../stores/addresses.store'
import type { Address } from '../types'

const props = defineProps<{ address?: Address | null }>()
const emit = defineEmits<{ saved: [address: Address], cancel: [] }>()

const store = useAddressesStore()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const uid = useId()
const pending = ref(false)

const isEdit = computed(() => Boolean(props.address))
// La primera direccion siempre queda como predeterminada
const isFirst = computed(() => !isEdit.value && !store.items.length)

const a = props.address
const values = reactive({
  alias: a?.alias ?? '',
  recipientName: a?.recipientName ?? '',
  phone: a?.phone ?? '',
  cp: a?.cp ?? '',
  street: a?.street ?? '',
  exteriorNumber: a?.exteriorNumber ?? '',
  interiorNumber: a?.interiorNumber ?? '',
  colonia: a?.colonia ?? '',
  municipio: a?.municipio ?? '',
  estado: a?.estado ?? '',
  // PUT es reemplazo completo: se manda siempre el valor actual
  isDefault: a?.isDefault ?? false,
})

for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => clearField(key))
}

const { status: cpStatus } = usePostalCodeLookup(() => values.cp, (info) => {
  values.municipio = info.municipio
  values.estado = info.estado
})

const cpHint = computed(() => ({
  'idle': 'Con el código postal completamos municipio y estado.',
  'pending': 'Buscando código postal…',
  'found': 'Revisa que municipio y estado sean correctos.',
  'not-found': 'No encontramos ese código postal: captura municipio y estado a mano.',
})[cpStatus.value])

async function onSubmit() {
  const payload = validate(addressSchema, { ...values, isDefault: values.isDefault || isFirst.value })
  if (!payload) return

  pending.value = true
  try {
    const saved = props.address
      ? await store.update(props.address.id, payload)
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
      :id="`${uid}-alias`"
      v-slot="field"
      label="Nombre de la dirección"
      :error="fieldErrors.alias"
    >
      <UiInput
        :id="field.id"
        v-model="values.alias"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Casa, Oficina…"
        maxlength="50"
      />
    </UiField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UiField
        :id="`${uid}-recipient`"
        v-slot="field"
        label="Quién recibe"
        :error="fieldErrors.recipientName"
      >
        <UiInput
          :id="field.id"
          v-model="values.recipientName"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="name"
        />
      </UiField>
      <UiField
        :id="`${uid}-phone`"
        v-slot="field"
        label="Teléfono"
        :error="fieldErrors.phone"
      >
        <UiInput
          :id="field.id"
          v-model="values.phone"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
        />
      </UiField>
    </div>

    <UiField
      :id="`${uid}-cp`"
      v-slot="field"
      label="Código postal"
      :hint="cpHint"
      :error="fieldErrors.cp"
    >
      <div class="relative max-w-40">
        <UiInput
          :id="field.id"
          v-model="values.cp"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="5"
        />
        <Icon
          v-if="cpStatus === 'pending'"
          name="ph:circle-notch"
          class="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted motion-safe:animate-spin"
          aria-hidden="true"
        />
      </div>
    </UiField>

    <UiField
      :id="`${uid}-street`"
      v-slot="field"
      label="Calle"
      :error="fieldErrors.street"
    >
      <UiInput
        :id="field.id"
        v-model="values.street"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="address-line1"
      />
    </UiField>

    <div class="grid grid-cols-2 gap-4">
      <UiField
        :id="`${uid}-ext`"
        v-slot="field"
        label="Número exterior"
        :error="fieldErrors.exteriorNumber"
      >
        <UiInput
          :id="field.id"
          v-model="values.exteriorNumber"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        />
      </UiField>
      <UiField
        :id="`${uid}-int`"
        v-slot="field"
        label="Interior"
        optional
        :error="fieldErrors.interiorNumber"
      >
        <UiInput
          :id="field.id"
          v-model="values.interiorNumber"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-line2"
        />
      </UiField>
    </div>

    <UiField
      :id="`${uid}-colonia`"
      v-slot="field"
      label="Colonia"
      :error="fieldErrors.colonia"
    >
      <UiInput
        :id="field.id"
        v-model="values.colonia"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="address-level3"
      />
    </UiField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UiField
        :id="`${uid}-municipio`"
        v-slot="field"
        label="Municipio o alcaldía"
        :error="fieldErrors.municipio"
      >
        <UiInput
          :id="field.id"
          v-model="values.municipio"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-level2"
        />
      </UiField>
      <UiField
        :id="`${uid}-estado`"
        v-slot="field"
        label="Estado"
        :error="fieldErrors.estado"
      >
        <UiInput
          :id="field.id"
          v-model="values.estado"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-level1"
        />
      </UiField>
    </div>

    <UiSwitch
      v-if="!isFirst"
      :id="`${uid}-default`"
      v-model="values.isDefault"
      label="Usar como predeterminada"
      description="Es la que proponemos primero en el checkout."
    />
    <p
      v-else
      class="text-[13px] text-ink-muted"
    >
      Al ser tu primera dirección, quedará como predeterminada.
    </p>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        {{ isEdit ? 'Guardar cambios' : 'Guardar dirección' }}
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
