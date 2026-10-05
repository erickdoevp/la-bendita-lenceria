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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <div class="grid gap-5 sm:grid-cols-2">
      <UiField
        :id="`${uid}-carrier`"
        v-slot="field"
        label="Paquetería"
        :error="fieldErrors.carrier"
      >
        <UiInput
          :id="field.id"
          v-model="values.carrier"
          :list="`${uid}-carriers`"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
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
      </UiField>

      <UiField
        :id="`${uid}-tracking`"
        v-slot="field"
        label="Número de guía"
        :error="fieldErrors.trackingNumber"
      >
        <UiInput
          :id="field.id"
          v-model="values.trackingNumber"
          class="font-mono"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          placeholder="1234567890"
          autocomplete="off"
          spellcheck="false"
        />
      </UiField>
    </div>

    <UiField
      :id="`${uid}-url`"
      v-slot="field"
      label="Liga de rastreo"
      optional
      :error="fieldErrors.trackingUrl"
    >
      <UiInput
        :id="field.id"
        v-model="values.trackingUrl"
        type="url"
        inputmode="url"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="https://"
        autocomplete="off"
      />
    </UiField>

    <UiField
      :id="`${uid}-eta`"
      v-slot="field"
      label="Entrega estimada"
      optional
      :error="fieldErrors.estimatedDeliveryAt"
    >
      <UiInput
        :id="field.id"
        v-model="values.estimatedDeliveryAt"
        type="date"
        :min="today"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
      />
    </UiField>

    <UiField
      :id="`${uid}-notes`"
      v-slot="field"
      label="Notas del envío"
      optional
      :error="fieldErrors.notes"
    >
      <UiInput
        :id="field.id"
        v-model="values.notes"
        maxlength="500"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Caja chica"
        autocomplete="off"
      />
    </UiField>

    <div class="flex flex-wrap justify-end gap-2">
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
      <UiButton
        type="submit"
        icon="ph:truck"
        :loading="pending"
      >
        Registrar envío
      </UiButton>
    </div>
  </form>
</template>
