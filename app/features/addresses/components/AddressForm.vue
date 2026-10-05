<script setup lang="ts">
import { usePostalCodeLookup } from '../composables/usePostalCodeLookup'
import { addressSchema } from '../schemas'
import { useAddressesStore } from '../stores/addresses.store'
import type { Address } from '../types'

const props = defineProps<{ address?: Address | null }>()
const emit = defineEmits<{ saved: [address: Address], cancel: [] }>()

const store = useAddressesStore()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Nombre de la dirección"
      :error="fieldErrors.alias"
    >
      <UInput
        v-model="values.alias"
        placeholder="Casa, Oficina…"
        maxlength="50"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UFormField
        label="Quién recibe"
        :error="fieldErrors.recipientName"
      >
        <UInput
          v-model="values.recipientName"
          autocomplete="name"
        />
      </UFormField>
      <UFormField
        label="Teléfono"
        :error="fieldErrors.phone"
      >
        <UInput
          v-model="values.phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
        />
      </UFormField>
    </div>

    <UFormField
      label="Código postal"
      :help="cpHint"
      :error="fieldErrors.cp"
    >
      <div class="relative max-w-40">
        <UInput
          v-model="values.cp"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="5"
        />
        <UIcon
          v-if="cpStatus === 'pending'"
          name="ph:circle-notch"
          class="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted motion-safe:animate-spin"
          aria-hidden="true"
        />
      </div>
    </UFormField>

    <UFormField
      label="Calle"
      :error="fieldErrors.street"
    >
      <UInput
        v-model="values.street"
        autocomplete="address-line1"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField
        label="Número exterior"
        :error="fieldErrors.exteriorNumber"
      >
        <UInput
          v-model="values.exteriorNumber"
        />
      </UFormField>
      <UFormField
        label="Interior"
        :error="fieldErrors.interiorNumber"
        hint="Opcional"
      >
        <UInput
          v-model="values.interiorNumber"
          autocomplete="address-line2"
        />
      </UFormField>
    </div>

    <UFormField
      label="Colonia"
      :error="fieldErrors.colonia"
    >
      <UInput
        v-model="values.colonia"
        autocomplete="address-level3"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UFormField
        label="Municipio o alcaldía"
        :error="fieldErrors.municipio"
      >
        <UInput
          v-model="values.municipio"
          autocomplete="address-level2"
        />
      </UFormField>
      <UFormField
        label="Estado"
        :error="fieldErrors.estado"
      >
        <UInput
          v-model="values.estado"
          autocomplete="address-level1"
        />
      </UFormField>
    </div>

    <USwitch
      v-if="!isFirst"
      v-model="values.isDefault"
      label="Usar como predeterminada"
      description="Es la que proponemos primero en el checkout."
    />
    <p
      v-else
      class="text-sm text-muted"
    >
      Al ser tu primera dirección, quedará como predeterminada.
    </p>

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        :label="isEdit ? 'Guardar cambios' : 'Guardar dirección'"
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
