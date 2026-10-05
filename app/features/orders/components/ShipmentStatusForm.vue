<script setup lang="ts">
import { SHIPMENT_STATUS_LABELS } from '../constants'
import { shipmentStatusSchema } from '../schemas'
import { useOrdersApi } from '../services'
import type { Shipment, ShipmentStatus } from '../types'

const props = defineProps<{ shipment: Shipment }>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({ status: props.shipment.status as ShipmentStatus, notes: '' })
const pending = ref(false)
const uid = useId()

const statusOptions = Object.entries(SHIPMENT_STATUS_LABELS) as [ShipmentStatus, string][]

watch(() => values.status, () => clearField('status'))
watch(() => values.notes, () => clearField('notes'))

async function onSubmit() {
  const payload = validate(shipmentStatusSchema, values)
  if (!payload) return

  pending.value = true
  try {
    await api.updateShipmentStatus(props.shipment.id, payload)
    emit('done', payload.status === 'DELIVERED' ? 'Envío entregado. La orden quedó como entregada.' : 'Envío actualizado.')
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
      :id="`${uid}-status`"
      v-slot="field"
      label="Estado del envío"
      :error="fieldErrors.status"
    >
      <UiSelect
        :id="field.id"
        v-model="values.status"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
      >
        <option
          v-for="[value, label] in statusOptions"
          :key="value"
          :value="value"
        >
          {{ label }}
        </option>
      </UiSelect>
    </UiField>

    <UiAlert
      v-if="values.status === 'DELIVERED'"
      tone="info"
    >
      La orden pasará a <strong>Entregada</strong>.
    </UiAlert>
    <UiAlert
      v-else-if="values.status === 'FAILED' || values.status === 'RETURNED'"
      tone="info"
    >
      La orden no cambia de estado. Después decide si reenvías o reembolsas.
    </UiAlert>

    <UiField
      :id="`${uid}-notes`"
      v-slot="field"
      label="Notas"
      optional
      hint="Reemplaza las notas actuales del envío."
      :error="fieldErrors.notes"
    >
      <UiInput
        :id="field.id"
        v-model="values.notes"
        maxlength="500"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Salió de CDMX"
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
        icon="ph:floppy-disk"
        :loading="pending"
        :disabled="values.status === shipment.status && !values.notes.trim()"
      >
        Guardar
      </UiButton>
    </div>
  </form>
</template>
