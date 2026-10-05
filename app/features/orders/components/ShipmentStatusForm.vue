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

const statusItems = (Object.entries(SHIPMENT_STATUS_LABELS) as [ShipmentStatus, string][]).map(([value, label]) => ({ label, value }))

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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Estado del envío"
      :error="fieldErrors.status"
    >
      <USelect
        v-model="values.status"
        :items="statusItems"
      />
    </UFormField>

    <UAlert
      v-if="values.status === 'DELIVERED'"
      color="primary"
      icon="ph:info"
    >
      <template #title>
        La orden pasará a <strong>Entregada</strong>.
    
      </template>
    </UAlert>
    <UAlert
      v-else-if="values.status === 'FAILED' || values.status === 'RETURNED'"
      color="primary"
      icon="ph:info"
      title="La orden no cambia de estado. Después decide si reenvías o reembolsas."
    />

    <UFormField
      label="Notas"
      help="Reemplaza las notas actuales del envío."
      :error="fieldErrors.notes"
      hint="Opcional"
    >
      <UInput
        v-model="values.notes"
        maxlength="500"
        placeholder="Salió de CDMX"
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
        icon="ph:floppy-disk"
        :loading="pending"
        :disabled="values.status === shipment.status && !values.notes.trim()"
        label="Guardar"
      />
    </div>
  </form>
</template>
