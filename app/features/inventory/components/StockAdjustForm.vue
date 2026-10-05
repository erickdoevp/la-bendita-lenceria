<script setup lang="ts">
import { stockEntrySchema, stockExitSchema } from '../schemas'
import { useInventoryApi } from '../services'
import type { Inventory, StockLevels } from '../types'

const props = defineProps<{
  variantId: string
  levels: StockLevels
  mode: 'entry' | 'exit'
}>()
const emit = defineEmits<{ saved: [inventory: Inventory], cancel: [] }>()

const api = useInventoryApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({ quantity: '' as number | string, reason: '' })
const pending = ref(false)

const isEntry = computed(() => props.mode === 'entry')
const quantity = computed(() => Math.trunc(toNumber(values.quantity)))
const nextStock = computed(() => props.levels.stock + (isEntry.value ? quantity.value : -quantity.value))

watch(() => values.quantity, () => clearField('quantity'))
watch(() => values.reason, () => clearField('reason'))

async function onSubmit() {
  const schema = isEntry.value ? stockEntrySchema : stockExitSchema(props.levels.availableStock)
  const payload = validate(schema, values)
  if (!payload) return

  pending.value = true
  try {
    emit('saved', await api.adjustStock(props.variantId, payload))
  }
  catch (error) {
    const info = applyApiError(error)
    // El backend nombra el campo "delta"; en el formulario es "quantity"
    if (info.fieldErrors.delta) fieldErrors.value = { quantity: info.fieldErrors.delta }
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
      label="Cantidad"
      :help="isEntry ? 'Unidades que llegan al almacén.' : `Máximo ${levels.availableStock}: lo reservado en pedidos no se puede sacar.`"
      :error="fieldErrors.quantity"
    >
      <UInput
        v-model.number="values.quantity"
        type="number"
        inputmode="numeric"
        min="1"
        :max="isEntry ? undefined : levels.availableStock"
        step="1"
        :placeholder="isEntry ? '50' : '2'"
        autofocus
      />
    </UFormField>

    <UFormField
      label="Motivo"
      help="Queda en el kardex para auditoría."
      :error="fieldErrors.reason"
    >
      <UTextarea
        v-model="values.reason"
        class="min-h-20"
        maxlength="255"
        :placeholder="isEntry ? 'Compra proveedor X, factura 123' : 'Merma: 2 piezas dañadas'"
        autoresize
      />
    </UFormField>

    <p
      class="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm"
      aria-live="polite"
    >
      <span class="text-muted">Stock físico</span>
      <span class="tabular-nums">
        <span class="text-muted">{{ levels.stock }}</span>
        <UIcon
          name="ph:arrow-right"
          class="mx-1.5 size-3.5 align-[-2px] text-muted"
          aria-label="pasa a"
        />
        <span
          class="font-semibold"
          :class="quantity > 0 ? (isEntry ? 'text-success' : 'text-error') : 'text-highlighted'"
        >{{ nextStock }}</span>
      </span>
    </p>

    <div class="flex flex-wrap justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
      <!-- loading deshabilita el boton: los ajustes no son idempotentes -->
      <UButton
        type="submit"
        :loading="pending"
        :icon="isEntry ? 'ph:tray-arrow-down' : 'ph:tray-arrow-up'"
        :label="isEntry ? 'Registrar entrada' : 'Registrar salida'"
      />
    </div>
  </form>
</template>
