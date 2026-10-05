<script setup lang="ts">
import { CARRIER_SUGGESTIONS } from '../constants'
import { shipmentSchema } from '../schemas'
import { useOrdersApi } from '../services'
import type { Order } from '../types'

const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({ carrier: '', trackingNumber: '', trackingUrl: '', estimatedDeliveryAt: '', notes: '' })
const pending = ref(false)
const uid = useId()

const today = new Date().toLocaleDateString('en-CA')

for (const field of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[field], () => clearField(field))
}

async function onSubmit() {
  const payload = validate(shipmentSchema, values)
  if (!payload) return

  pending.value = true
  try {
    await api.createShipment({ orderId: props.order.id, ...payload })
    emit('done', 'Envío registrado. La orden quedó como enviada.')
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

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        label="Paquetería"
        :error="fieldErrors.carrier"
      >
        <UInput
          v-model="values.carrier"
          :list="`${uid}-carriers`"
          placeholder="Estafeta"
          autocomplete="off"
          autofocus
        />
        <datalist :id="`${uid}-carriers`">
          <option
            v-for="carrier in CARRIER_SUGGESTIONS"
            :key="carrier"
            :value="carrier"
          />
        </datalist>
      </UFormField>

      <UFormField
        label="Número de guía"
        :error="fieldErrors.trackingNumber"
      >
        <UInput
          v-model="values.trackingNumber"
          class="font-mono"
          placeholder="1234567890"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormField>
    </div>

    <UFormField
      label="Liga de rastreo"
      :error="fieldErrors.trackingUrl"
      hint="Opcional"
    >
      <UInput
        v-model="values.trackingUrl"
        type="url"
        inputmode="url"
        placeholder="https://"
        autocomplete="off"
      />
    </UFormField>

    <UFormField
      label="Entrega estimada"
      :error="fieldErrors.estimatedDeliveryAt"
      hint="Opcional"
    >
      <UInput
        v-model="values.estimatedDeliveryAt"
        type="date"
        :min="today"
      />
    </UFormField>

    <UFormField
      label="Notas del envío"
      :error="fieldErrors.notes"
      hint="Opcional"
    >
      <UInput
        v-model="values.notes"
        maxlength="500"
        placeholder="Caja chica"
        autocomplete="off"
      />
    </UFormField>

    <div class="flex flex-wrap justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        icon="ph:truck"
        :loading="pending"
        label="Registrar envío"
      />
    </div>
  </form>
</template>
